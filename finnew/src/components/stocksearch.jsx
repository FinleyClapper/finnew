import styled from 'styled-components';
import React, { useState } from 'react';
async function stock_search(keyword){
    const API_BASE = 'http://127.0.0.1:5000'
    try {
        const response = await fetch(`${API_BASE}/api/stocks/search?keyword=${keyword}`);
        const stocks = await response.json();
        console.log(stocks);
        return stocks.bestMatches || [];
            }
    catch (error) {
        console.log(error);

        }
}
function SearchBar(){
    const [value, setValue] = useState('');
    const [results, setResults] = useState([]);
    const handleChange = async (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    if(value !== ''){
        const stocks = await stock_search(value);
        setResults(stocks.slice(0, 5));
    }
    else{
      setResults([]);
    }
  };

  return (
    <StyledWrapper>
      <div className="search">
        <input type="text" className="search__input" placeholder="Type your text" value={value} onChange={handleChange}/>
        <button className="search__button">a
          <svg className="search__icon" aria-hidden="true" viewBox="0 0 24 24">
            <g>
              <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
            </g>
          </svg>
        </button>
      </div>
      {results.length > 0 && (
        <div className="results">
          {results.map((stock, index) => (
            <div key={index} className="result-item">
              <strong>{stock['1. symbol']}</strong> — {stock['2. name']}
            </div>
          ))}
        </div>
      )}
    </StyledWrapper>
  );}

const StyledWrapper = styled.div`
  .search {
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: center;
    position: relative;
  }

  .search__input {
    font-family: inherit;
    font-size: inherit;
    background-color: #f4f2f2;
    border: none;
    color: #646464;
    padding: 0.7rem 1rem;
    border-radius: 30px;
    width: 12em;
    transition: all ease-in-out 0.5s;
    margin-right: -2rem;
  }

  .search__input:hover,
  .search__input:focus {
    box-shadow: 0 0 1em #00000013;
  }

  .search__input:focus {
    outline: none;
    background-color: #f0eeee;
  }

  .search__button {
    border: none;
    background-color: #f4f2f2;
    margin-top: 0.1em;
  }

  .search__button:hover {
    cursor: pointer;
  }

  .search__icon {
    height: 1.3em;
    width: 1.3em;
    fill: #b4b4b4;
  }

  /* Results dropdown */
  .results {
    position: absolute;
    background: black;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    margin-top: 0.5rem;
    z-index: 10;
    text-align: left;
  }

  .result-item {
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .result-item:hover {
    background: #f0f0f0;
  }
`;

export default SearchBar;
