
  

# jobs-gatherer


 

## Requirements
  

- [ ] **NodeJS / NPM** ([download](https://nodejs.org/en/download/))

- [ ] **MongoDB** installed and the **mongod** service running ([tutorials](https://docs.mongodb.com/tutorials/) )


## Node modules used:

- [express](https://www.npmjs.com/package/express)

- [ejs](https://www.npmjs.com/package/ejs) (JavaScript HTML templates)

- [mongoose](https://www.npmjs.com/package/mongoose) (MongoDB interaction)

- [request](https://www.npmjs.com/search?q=request) (the module used to make the HTTP requests)

- [sse-pusher](https://www.npmjs.com/package/sse-pusher) (for sending Server Sent Events)

- [method-override](https://www.npmjs.com/package/method-override)

- [body-parser](https://www.npmjs.com/package/body-parser)

- [colors](https://www.npmjs.com/package/colors)

- [single-line-string](https://www.npmjs.com/package/single-line-string)


## Predefined sites

- ejobs (ro)
- bestjobs (ro)
- hipo (ro)
- olx (ro)

<br><br><br><br><br><br><br>


## **Description:**
<hr>
Node-JS local application which gathers jobs listings based on on a list of **queries** and **locations**. It searches in a list of predefined sites, which can be manually defining them in the code.

  

## **How it works:**
<hr>
The application makes an HTTP request to those websites using the: **query**, **location** and **page** arguments, receives an HTML text (string) as a response, which is parsed into a list(array) of `{name: String, url:String}` type of results by using Regular Expressions.

  

Starts with **page** 1 for each **query/location** combination, continues to increment the page until no results are found, in that moment it actually goes to the next **query/location** combination.

  

On the occasion of failed requests, it tried again for a number of 3 times, if all of them fail, it just skips the current **query/location** and tries the next one.

  

The search continues indefinitely, by going in a front-back in the **query/location** combination; the repetition is delayed to avoid excessive HTTP requests to the destination.

Site searches run in parallel.


<br><br><br><br><br><br><br>
## **How to start it:**

### Using a VM
--  Using Virtualbox (or other virtualization application that supports importing `.ova` files) and then importing [this](https://drive.google.com/file/d/13OkllXMF1u-B3QuwBk3hEH94XRbx9Igo/view) VM (Used Lubuntu x64 16, has NodeJS and MongoDB already installed) then following the instructions on the desktop (which are in a file in the desktop, `~/Desktop/`).

### In your own OS
-- make sure you have **NodeJS,** **MongoDB** and **git** installed

- clone this github repository (`git clone https://github.com/Slitthe/jobs-gatherer.git`)
- change directory to 'jobs-gatherer' (the cloned git repo directory)
- install the node dependencies by using `npm install` in the cloned repository's root directory
- start the mongod service
- run the `app.js`file using node (found in the root directory of the cloned repository)
- visit http://localhost:3000/ or http://127.0.0.1:3000/ to start the actual application with the dedsired sites selected


 



  
<br><br><br><br><br><br><br>
## **Adding additional sites:**

It is possible to add additional sites by manually defining in the `user_modules/sites.js` file:

1. Create an URL constructor for that site, which lives inside of the `user_modules/sites.js` file, `getUrls` method:

	* adding a base endpoint in the `urls` object, inside of the `getUrls` function (the name of that should be the name of the site).

	* create the actual URL constructor as a method in `siteUrls` object inside of the `reqUrls` function. The method needs to return a request URL given the `query`, `location` and `page` arguments)

2. Define the regular expressions needed to parse the HTML request response for that site, `parse` method of the `user_modules/sites.js`

	* add a property to the `expression` object in the `parse` function, which should be the name of that site

	* define three RegExp for that site: `items`, `href`, `name`

		* `items` should be a RegExp which captures the `href` and `title` of the job result, example (`/job-title.*?<\/a>`)

		* `href` should capture the link of that listing in its capture group 1 (`$1`), example (`/href="(.*?)"`)

		* `name` should capture the name of that result in its capture group 1 `($1`), example (`/>(.*?)<\/a>`)
   * (optionally) some sites may require to further specifiy in which container the actual results will live. 
      * This is the case of sites that actually display other 'relevant' similar results when there are no actually results for your specific query. 
      * For these cases you can define an `array`  of `regular expressions` in a property named `wrappers` (this array should be a property of the same object which holds the other RegExps: `items`, `href` and `name`).
      * The regular expressions are used from back to front (first --> last array item).
      * These expressions are used to actually pinpoint the HTML portion where the relevant results are.
         * For example the actual relevant results might be in a `<div class='relevant-results>`, whereas the 'suggested' results might be in a `<div class='suggestions-results>`. In this case you'd define a regexp to capture only the results inside the `relevant-results`, and if that contain is found, then it's as if the page had no results,therefore the search service skips to the next query/location parameter to make the next search request.


3. Add the name of the site in the `user_modules/sites.js` file, as a string in the `exportData.sites` array (same name as used in the other defining places, `parse` and `getUrls`)

  









<br><br><br><br><br>
## **Front-end interaction**
===========================


### **Interaction when first running the `app.js` file with node**
<hr>
After you run the the `app.js` file with `node`, to start the actual serch service, by visiting `/start`;

At this point, you can also delete database items by visiting `/debugging`. This is mainly for debugging purposes.

Once the search service is run, you cannot access `/start` and `/debugging` until you restart the node application.


### **When the search service is running**
<hr>

**ITEMS DISPLAY**

The first level of item categorization is by splitting them from which site that result came from.

Each site has its own route. Example `/ejobs` will lead you to the results from the **ejobs** site.

At this point, you have the ability to view the results for each site, categorize them into **saved**, **deleted** or **default**. This categorization is mainly to display them (moving an item to the **deleted** category doesn't actually delete it in the DB) in their type container; however, the exception are the **saved** results, which are exempt from their expiration date.

Items are further categorized by their location. Only the locations in the location list are displayed, even if other items with different location value are present in the database. To display them again, you have to add that location back into the location list


**SETTINGS CHANGE**

This page lives in the `/settings` route.

Serves as a settings change page, as well as status info display.

You can:
- modify the items from the **queries** and **locations** list
- start/stop the search service; This is necessary to modify the **queries/locations** list.

The live status for each site is also displayed on this page. Whenever a new search is made, the arguments used for the search are updated in the `Live search status` table.



<br><br><br><br><br>

## **Database**

  

The app uses **MongoDB** to save the results of the searches, as well as the list of **query/locations** and the current current or last known position of the search (so it can resume from that place).

  

**Expiry date:** each item has a created/updated timestamp, which is used to determine its expiry date, at which time that result is removed from the DB permanently (default expiry value: **7 days**). Results which have a category of `saved` are exempt from this behaviour.

  
  

<hr>

  

**Note**: Any data sanitzation is only meant to prevent the server from crashing. It does not concern the security of the application as it is meant to be run locally.