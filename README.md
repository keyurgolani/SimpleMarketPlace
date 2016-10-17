

# Simple Market Place
> An eBay Prototype

This project is an eBay prototype Simple Market Place with basic functionalities of User accounts, seling products and buying them. Bidding on them and winning the bids.

In order to checkout the thing, you better dive into it.

Please follow the instructions and you'll be good to go.
Don't worry, it's simple and quick! :)


## Usage

* **Making Sure you have everything set up.**

Let's first make sure that we have MySQL installed and ready to go on your machine.
Follow the page below to make sure that you have MySQL installed and running.
[Install MySQL](http://dev.mysql.com/doc/mysql-getting-started/en/)

Now, let's make sure to install Node.js and NPM, a package manager for Node.js and other JavaScript libraries.

You can find the Node.js download at this location [Install Node.js and NPM](https://nodejs.org/en/download/) where you'll install NPM package manager alongwith the Node.js binaries.

Clone the code from Github.
```
git clone https://github.com/keyurgolani/SimpleMarketPlace.git
```

Now go to `SimpleMarketPlace` directory.
```
cd SimpleMarketPlace
```

Now we open `SQL Queries for Simple Market Place.sql` file from `sql` folder in any text editor of your choice to execute all the queries inside it sequentially to generate the database fit for the purpose.

Now, we will install all the JavaScript libraries that we depend on for this project. It is a little long list, but it won't take much time.
```
npm install
```

Please wait till this finishes.
Now, we need to open `dao.js` file from `utils` folder which contains the details about database connection. Please change the below fields to the appropreate values.
```
        host : 'my_sql_server_ip_address',
        user : 'my_sql_user_name',
        password : 'my_sql_password',
        database : 'simple_market_place',
        port : my_sql_port_number   //Usually default value 3306
```

And that's it. We are ready to start the application.

* **Starting the server**

To start the server, run this command in the terminal.
```
npm start
```

This will start your application by default on `0.0.0.0` IP address with `3000` port number.

* **Exploring the application**

To explore the application, you can checkout the `documents` folder in the project folder to check the functionalities. Or just fire the application up at "http://localhost:3000/" and explore the wild!

#Happy eBaying!!