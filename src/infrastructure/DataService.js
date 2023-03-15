/*
 *
 * Copyright 2022 Bitxor Community
 *
 * Licensed under the Apache License, Version 2.0 (the "License ");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import http from './http';
import axios from 'axios';

class DataService {
  /**
   * Gets cryptocurrency market price from https://min-api.cryptocompare.com/
   * @param {string} cryptocurrency - name such as XEM, BTC
   * @returns {object} Object of data
   */
  static getMarketPrice = cryptocurrency => {
  	return new Promise((resolve, reject) => {
  		let url = http.marketDataUrl + `data/pricemultifull?fsyms=${cryptocurrency}&tsyms=USD`;

  		axios
  			.get(url)
  			.then(res => {
  				return resolve(res.data.DISPLAY);
  			})
  			.catch(error => {
  				// reject(new Error('Fail to request XEM price.'))
  				reject(new Error(error));
  			});
  	});
  }

  /**
   * Gets cryptocurrency historical hourly graph from https://min-api.cryptocompare.com/
   * @param {string} cryptocurrency - name such as XEM, BTC
   * @returns {array} Array of Data
   */
  static getHistoricalHourlyGraph = cryptocurrency => {
  	return new Promise((resolve, reject) => {
  		let url = http.marketDataUrl + `data/histohour?fsym=${cryptocurrency}&tsym=USD&limit=168`;

  		axios
  			.get(url)
  			.then(res => {
  				return resolve(res.data);
  			})
  			.catch(error => {
  				// reject(new Error('Fail to request Xem historical hourly graph.'))
  				reject(new Error(error));
  			});
  	});
  }
}

export default DataService;
