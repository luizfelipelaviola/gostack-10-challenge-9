import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) throw new AppError('User does not exists.');

    const items = await this.productsRepository.findAllById(
      products.map(product => ({ id: product.id })),
    );

    const existingItemsIds = items.map(product => product.id);

    const checkInexistentProducts = products.filter(
      product => !existingItemsIds.includes(product.id),
    );

    if (checkInexistentProducts.length)
      throw new AppError('One or more of your products does not exists');

    const findProductWithNoSufficientQuantity = items.find(product => {
      const productRegistry = products.find(item => item.id === product.id);
      if (!productRegistry) return true;

      if (product.quantity - productRegistry.quantity < 0) return true;
      return false;
    });

    if (findProductWithNoSufficientQuantity)
      throw new AppError(
        `Product "${findProductWithNoSufficientQuantity.name}" does not have enough quantity.`,
      );

    const order = await this.ordersRepository.create({
      customer,
      products: items.map(product => ({
        product_id: product.id,
        price: product.price,
        quantity: products.filter(item => item.id === product.id)[0].quantity,
      })),
    });

    const updateQuantity = items.map(product => {
      return {
        id: product.id,
        quantity:
          product.quantity -
          products.filter(item => item.id === product.id)[0].quantity,
      };
    });

    await this.productsRepository.updateQuantity(updateQuantity);

    return order;
  }
}

export default CreateOrderService;
