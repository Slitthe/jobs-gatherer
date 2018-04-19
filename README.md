
  

# jobs-gatherer


 

## Requirements
  

- [ ] **NodeJS / NPM**

- [ ] **MongoDB** installed and the **mongod** service running ([tutorials](https://docs.mongodb.com/tutorials/) )

## How to start it:

### Using a VM
--  Using Virtualbox (or other virtualization application that supports importing `.ova` files) and then importing [this](https://drive.google.com/file/d/13OkllXMF1u-B3QuwBk3hEH94XRbx9Igo/view) VM (Used Lubuntu x64 17, has NodeJS and MongoDB already installed) then following the instructions on the desktop.

### In your own OS
-- make sure you have **NodeJS,** **MongoDB** and **git** installed
-- clone this github repository (`git clone <repo address>`)
-- install the node dependencies by using `npm install` in the cloned repository's root directory
-- start the mongod service
-- run the `app.js`file using node (found in the root directory of the cloned repository)
-- access the front-end interface using the http://localhost:3000/ or http://127.0.0.1:3000/ (default PORT)


 <br><br><br><br><br><br><br><br>

## Description:

Node-JS local application which gathers jobs listings based on on a list of **queries** and **locations**. It searches in some predefined sites, which can be manually expanded (only romanian **ejobs** and **bestjobs** work so far) by defining them in the code.

  

## How it works:

The application makes an HTTP request to those websites using the: **query**, **location** and **page** arguments, receives an HTML text (string) as a response, which is parsed into a list(array) of `{name: String, url:String}` type of results by using Regular Expressions.

  

Starts with **page** 1 for each **query/location** combination, continues to increment the page until no results are found, in that moment it actually goes to the next **query/location** combination.

  

On the occasion of failed requests, it tried again for a number of 3 times, if all of them fail, it just skips the current **query/location** and tries the next one.

  

The search continues indefinitely, by going in a front-back in the **query/location** combination; the repetition is delayed to avoid excessive HTTP requests to the destination.

Site searches run in parallel.

  
<br><br><br><br><br><br><br><br><br>
## Adding additional sites:

It is possible to add additional sites by manually defining them like so:

1. Create an URL constructor for that site, which lives inside of the `user_modules/search.js` file:

	* (optionally) adding a base endpoint in the `urls` object, inside of the `getUrls` function (the name of that should be the name of the site).

	* create the actual URL constructor as a method in `siteUrls` object inside of the `reqUrls` function. The method needs to return a request URL given the `query`, `location` and `page` arguments)

2. Modify the `user_modules/search.js` file

	* add a property to the `expression` object in the `parse` function, which should be the name of that site

	* define three RegExp for that site: `items`, `href`, `name`

		* `items` should be a RegExp which captures the `href` and `title` of the job result, example (`/job-title.*?<\/a>`)

		* `href` should capture the link of that listing in its capture group 1 (`$1`), example (`/href="(.*?)"`)

		* `name` should capture the name of that result in its capture group 1 `($1`), example (`/>(.*?)<\/a>`)

3. Add the name of the site in the `user_modules/data.js` file, as a string in the `exportData.sites` array

  

## Node modules used:

-- [Express](https://www.npmjs.com/package/express)

-- [EJS](https://www.npmjs.com/package/ejs) (JavaScript HTML templates)

-- [mongoose](https://www.npmjs.com/package/mongoose) (MongoDB interaction)

-- [request](https://www.npmjs.com/search?q=request) (the module used to make the HTTP requests)

-- [sse-pusher](https://www.npmjs.com/package/sse-pusher) (for sending Server Sent Events)

-- [method-override](https://www.npmjs.com/package/method-override)

-- [body-parser](https://www.npmjs.com/package/body-parser)

<br><br><br><br><br>
## Front-end interaction

Displaying the basic settings, as well as the results can be made via the front-end interface interaction provided, using.

  

By default, the server listens on the `localhost:3000`.

  

Results are categorized by sites, and then subcategorized by their location and category (saved, normal and deleted). The category of each result can be changed using the front-end interface (example: visiting the `/ejobs` route and then clicking on the buttons for that result to move it into another display category), that move is saved into the Database.

  

## Database

  

The app uses **MongoDB** to save the results of the searches, as well as the list of **query/locations** and the current current or last known position of the search (so it can resume from that place).

  

**Expiry date:** each item has a created/updated timestamp, which is used to determine its expiry date, at which time that result is removed from the DB permanently (default expiry value: **7 days**). Results which have a category of `saved` are exempt from this behaviour.

  
  

<hr>

  

**Note**: Any data sanitzation is only meant to prevent the server from crashing. It does not concern the security of the application as it is meant to be run locally.