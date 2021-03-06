import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';

import { retry, catchError, timeout, delay } from 'rxjs/operators';
import * as _ from 'lodash';
import { Quote } from './models/quote';
import { UserStock } from './models/user';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class StockService {
  users = [];
  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;
  constructor(private http: HttpClient, private db: AngularFireDatabase) {
    this.itemsRef = db.list('user');
    // Use snapshotChanges().map() to store the key
    this.items = this.itemsRef
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({
             key: c.payload.key, 
             ...c.payload.val() }))
        )
      );
    console.log('get items: ', this.items);
  }

  //Finnhubb URLS
  stockURL: string = 'https://finnhub.io/api/v1';
  symbolURL: string = '/stock/symbol?exchange=US';
  newsURL: string = '/news?category=general';
  companyProfileURL: string = '/stock/profile2?symbol=';
  public tokenURL: string = 'token=br2p5tvrh5rbm8ou56tg';
  public quoteURL: string = '/quote?symbol=';
  slug: string;

  // companynewsURL '/company-news?symbol=AAPL&from=2020-04-30&to=2020-05-01'
  // earnings '/calendar/earnings?from=2010-01-01&to=2020-03-15&symbol=AAPL'

  //FirebaseURLS
  userURL: string = 'https://stockappdb.firebaseio.com/stocks/user';
  firebaseURL: string = 'https://stockappdb.firebaseio.com/';
  myStocksURL: string = '/myStocks';
  watchListURL: string = '/watchList';

  //MSC needed variables
  profile = [];
  symbols: any;
  topArray: string[] = [
    'MSFT',
    'AAPL',
    'AMZN',
    'GOOGL',
    'FB',
    'INTL',
    'VZ',
    'ADBE',
    'CSCO',
    'ORCL',
    'CRM',
    'UAA',
    'LVMHF',
    'NKE',
    'HON',
    // 'HESAY',
    // 'MRO',
    // 'XOM',
    // 'CVX',
    // 'JNJ',
    // 'HD',
    // 'CGC',
  ];

  // quotes: Quote[] = [];
  quotes = [];

  getUserStocks(uid: string) {
    return new Observable((observer) => {
      this.db
        .object('/stocks/user/2HIvkHW0okbOw6MaYs6MpkRZVuy2/watchList')
        .snapshotChanges()
        .subscribe((snapshots) => {
          console.log('snapshot: ', snapshots);
          observer.next(snapshots.payload.val());
        });
    });
  }

  // getUserStocks(uid: string) {
  //   return new Promise<any>((resolve, reject) => {
  //     this.db
  //       .object('/stocks/user')
  //       .snapshotChanges()
  //       .subscribe((snapshots) => {
  //         console.log('snapshot: ', snapshots);
  //         resolve(snapshots);
  //       });
  //   });
  // }
  //Finnhub Stock api calls
  //get list of symbols
  getSymbols() {
    return this.http.get(`${this.stockURL}${this.symbolURL}&${this.tokenURL}`);
  }
  //get news general category
  getNews() {
    return this.http.get(`${this.stockURL}${this.newsURL}&${this.tokenURL}`);
  }
  // get Profile information
  getProfile(input: string) {
    this.http
      .get(`${this.stockURL}${this.companyProfileURL}${input}${this.tokenURL}`)
      .subscribe((data) => {
        console.log(data);
        this.profile.push(data);
      });
    return this.profile;
  }
  //get a quote
  public getQuote(input: string) {
    let quoteurl = `${this.stockURL}${this.quoteURL}${input}${this.tokenURL}`;
    return this.http.get<Quote[]>(quoteurl);
  }
  //get top movers data
  getTopMovers() {
    this.topArray.map((item) => {
      this.http
        .get(`${this.stockURL}${this.quoteURL}${item}&${this.tokenURL}`)
        .pipe(timeout(5000))
        .subscribe((data) => {
          let obj: { [key: string]: any } = data;
          obj.symbol = item;
          obj.current = data['c'];
          obj.previous = data['pc'];
          this.quotes.push(obj);
        });
    });

    return this.quotes;
  }

  //for testing only... remove after
  getData(input: string) {
    return this.http.get(
      `${this.stockURL}${this.companyProfileURL}${input}&${this.tokenURL}`
    );
  }

  //get current price
  getPrice(input: string) {
    return this.http.get(
      `https://finnhub.io/api/v1/quote?symbol=${input}&${this.tokenURL}`
    );
  }

  // //Profile API Calls
  // //User Profile Stock List
  // //get profile stock
  getStockList(uid:string){
   let getStocks = this.db.object(`/stock/user/${uid}/mystocks`)
  }
    
  //   //buy stock add to stocklist
    addStock(value:number,symbol:string,shares:number,uid:string){
      let userStocks = this.db.object(`/stocks/user/${uid}/myStocks`)
      userStocks.set(
        {
        symbol:shares
        })
      let userbalance:any = this.db.object(`/stocks/user/${uid}/balance`)
      let totalvalue = (shares*value);
      let getValue = (userbalance - totalvalue);
      userbalance.set(getValue); 
     };
   
    //delete profile stock
    deleteStock(arg:number) {
      
      };

    //User Profile Watch List
    //get profile Watch List
    getWatchList(arg:number) {
      
      };

    //add to Watch List
    addStockWatch(arg:number){
      

    }
    //delete from Watch List
    deleteStockWatch(arg:number) {
      
      }
}

// functions we want
//SignIn()
//signInWithEmailAndPassword ( email :  string ,  password :  string ) : Promise < UserCredential >
//SignOut
//signOut ( ) : Promise < void >
//CreateNewAcc
//createUserWithEmailAndPassword ( email :  string ,  password :  string ) : Promise < UserCredential >
// getSymbols():Observable<Symbol[]> {
//   return this.http.get<Symbol>()`${stockURL}${symbolURL}`}
//calender earnings
//getprofile
//company news
// _.forEach(this.topMovers, function(symbol){
// let tmSymbol = this.symbol;
// return
// type Profile = {
//   address: string
//   city: string
//   state: string
//   country: string
//   name: string
//   ticker: string
//   logo: string
//   desc: string
//   url: string
//   gsector: string

// }
// let newprofile = <Profile>{
//  address: this.profile.address,
//  city: this.profile.city,
//  state: this.profile.state,
//  country:  this.profile.country,
//  name: this.profile.name,
//  ticker: this.profile.ticker,
//  logo: this.profile.logo,
//  desc: this.profile.desc,
//  gsector: this.profile.gsector,
//  url:  this.profile.weburl
// }
