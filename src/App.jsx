/* eslint-disable jsx-a11y/accessible-emoji */
// import React from 'react';
import './App.scss';
import { useState } from 'react';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const getFilteredProducts = (
  products,
  filterByUser,
  filterByQuery,
  selectedCategories,
  sortByColumn = {},
) => {
  let filteredProducts = [...products];

  if (filterByUser) {
    filteredProducts = filteredProducts.filter(
      ({ user }) => user.name === filterByUser,
    );
  }

  if (filterByQuery) {
    filteredProducts = filteredProducts.filter(({ name }) => {
      const fixedQuery = filterByQuery.toLowerCase().trim();

      return name.toLowerCase().includes(fixedQuery);
    });
  }

  if (selectedCategories.size) {
    filteredProducts = filteredProducts.filter(({ category }) =>
      selectedCategories.has(category.title),
    );
  }

  const sortColumn = Object.entries(sortByColumn);

  if (sortColumn.length !== 0) {
    let columnName = '';

    switch (sortColumn[0][0]) {
      case 'ID':
        columnName = 'id';
        break;

      case 'Product':
        columnName = 'name';
        break;

      case 'Category':
        columnName = 'category.title';
        break;

      case 'User':
        columnName = 'user.name';
        break;

      default:
        break;
    }

    const columnValue = sortColumn[0][1];

    filteredProducts = filteredProducts.sort((prod1, prod2) => {
      switch (typeof prod1[columnName]) {
        case 'number':
          return (prod1[columnName] - prod2[columnName]) * columnValue;

        case 'string':
          return (
            prod1[columnName].localeCompare(prod2[columnName]) * columnValue
          );

        default:
          return 0;
      }
    });
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
      category: productCategories,
    };
  });
};

const COLUMNS = ['ID', 'Product', 'Category', 'User'];

export const App = () => {
  const [filterByUser, setFilterByUser] = useState('');
  const [filterByQuery, setFilterByQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [sortByColumn, setSortByColumn] = useState({});
  const products = getProducts(productsFromServer);
  const filteredProducts = getFilteredProducts(
    products,
    filterByUser,
    filterByQuery,
    selectedCategories,
    sortByColumn,
  );

  const resetFilters = () => {
    setFilterByUser('');
    setFilterByQuery('');
    setSelectedCategories(new Set());
  };

  const changeSelectedCategories = category => {
    // eslint-disable-next-line no-unused-expressions
    selectedCategories.has(category)
      ? selectedCategories.delete(category)
      : selectedCategories.add(category);

    setSelectedCategories(new Set(selectedCategories));
  };

  const changeSelectedColumn = column => {
    if (!Object.hasOwn(sortByColumn, column)) {
      setSortByColumn({ [column]: 1 });

      return;
    }

    if (sortByColumn[column] === 1) {
      setSortByColumn({ [column]: -1 });

      return;
    }

    setSortByColumn({});
  };

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
                  value={filterByQuery}
                  onChange={event => setFilterByQuery(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {filterByQuery && (
                  <span className="icon is-right">
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setFilterByQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategories.size,
                })}
                onClick={() => setSelectedCategories(new Set())}
              >
                All
              </a>

              {categoriesFromServer.map(({ title }) => (
                <a
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategories.has(title),
                  })}
                  href="#/"
                  onClick={() => changeSelectedCategories(title)}
                >
                  {title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={resetFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {!filteredProducts.length ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {COLUMNS.map(column => {
                    const isSortedColumn = Object.hasOwn(sortByColumn, column);
                    const columnIcon = isSortedColumn
                      ? sortByColumn[column]
                      : 0;

                    return (
                      <th>
                        <span className="is-flex is-flex-wrap-nowrap">
                          {column}
                          <a
                            href="#/"
                            onClick={() => changeSelectedColumn(column)}
                          >
                            <span className="icon">
                              <i
                                data-cy="SortIcon"
                                className={cn('fas', {
                                  'fa-sort': !isSortedColumn,
                                  'fa-sort-up': columnIcon === 1,
                                  'fa-sort-down': columnIcon === -1,
                                })}
                              />
                            </span>
                          </a>
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(product => {
                  const { id, name: productName, user, category } = product;
                  const { name: userName, sex } = user;
                  const categoryName = `${category.icon} - ${category.title}`;

                  return (
                    <tr data-cy="Product" key="id">
                      <td className="has-text-weight-bold" data-cy="ProductId">
                        {id}
                      </td>

                      <td data-cy="ProductName">{productName}</td>
                      <td data-cy="ProductCategory">{categoryName}</td>

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
          )}
        </div>
      </div>
    </div>
  );
};
