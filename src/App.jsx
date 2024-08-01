/* eslint-disable jsx-a11y/accessible-emoji */
// import React from 'react';
import './App.scss';
import { useState } from 'react';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const getFilteredProducts = (products, byUser = '') => {
  let filteredProducts = [...products];

  if (byUser) {
    filteredProducts = filteredProducts.filter(
      ({ user }) => user.name === byUser,
    );
  }

  return filteredProducts;
};

const getProducts = products => {
  return products.map(product => {
    const productCategories = categoriesFromServer.find(
      ({ id }) => id === product.categoryId,
    );
    const productUser = usersFromServer.find(
      ({ id }) => productCategories.ownerId === id,
    );

    return {
      ...product,
      user: productUser,
      categories: productCategories,
    };
  });
};

export const App = () => {
  const [filterByUser, setFilterByUser] = useState('');
  const products = getProducts(productsFromServer);
  const filteredProducts = getFilteredProducts(products, filterByUser);

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({
                  'is-active': !filterByUser,
                })}
                onClick={() => setFilterByUser('')}
              >
                All
              </a>

              {usersFromServer.map(({ name }) => (
                <a
                  data-cy="FilterUser"
                  href="#/"
                  className={cn({
                    'is-active': filterByUser === name,
                  })}
                  onClick={() => setFilterByUser(name)}
                >
                  {name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value="qwe"
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  <button
                    data-cy="ClearButton"
                    type="button"
                    className="delete"
                  />
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className="button is-success mr-6 is-outlined"
              >
                All
              </a>

              <a
                data-cy="Category"
                className="button mr-2 my-1 is-info"
                href="#/"
              >
                Category 1
              </a>

              <a data-cy="Category" className="button mr-2 my-1" href="#/">
                Category 2
              </a>

              <a
                data-cy="Category"
                className="button mr-2 my-1 is-info"
                href="#/"
              >
                Category 3
              </a>
              <a data-cy="Category" className="button mr-2 my-1" href="#/">
                Category 4
              </a>
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          <p data-cy="NoMatchingMessage">
            No products matching selected criteria
          </p>

          <table
            data-cy="ProductTable"
            className="table is-striped is-narrow is-fullwidth"
          >
            <thead>
              <tr>
                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    ID
                    <a href="#/">
                      <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort" />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    Product
                    <a href="#/">
                      <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort-down" />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    Category
                    <a href="#/">
                      <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort-up" />
                      </span>
                    </a>
                  </span>
                </th>

                <th>
                  <span className="is-flex is-flex-wrap-nowrap">
                    User
                    <a href="#/">
                      <span className="icon">
                        <i data-cy="SortIcon" className="fas fa-sort" />
                      </span>
                    </a>
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map(product => {
                const { id, name: productName, user, categories } = product;
                const { name: userName, sex } = user;
                const categoriesName = `${categories.icon} - ${categories.title}`;

                return (
                  <tr data-cy="Product" key="id">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {id}
                    </td>

                    <td data-cy="ProductName">{productName}</td>
                    <td data-cy="ProductCategory">{categoriesName}</td>

                    <td
                      data-cy="ProductUser"
                      className={cn({
                        'has-text-link': sex === 'm',
                        'has-text-danger': sex === 'f',
                      })}
                    >
                      {userName}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
