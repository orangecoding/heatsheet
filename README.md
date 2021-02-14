# HeatSheet  

An overview for your Tado data.  [![Build Status](https://travis-ci.org/orangecoding/heatsheet.svg?branch=master)](https://travis-ci.org/orangecoding/heatsheet)
  
[Tado thermostats](https://www.tado.com/de-en/products/smart-radiator-starter-kit) are an easy and comfortable way to turn any heater into a smart-heater. We're using them throughout our apartment to not worry about heating.  

However as good as the hardware is, the software (still) lacks the ability to export data and show them on a yearly basis (or showing bigger time-windows than just a single day). 
  
HeatSheet is changing this. It uses (unofficial) Tado API's, to get the data out of your account and displays them either as a chart or table view. Depending on the chosen granularity, you can analyse your heating behaviour much better, therefor safe money and maybe.. just maybe save the :earth_africa: by adapting your heating behaviours. 
  
![Charts](/docs/chart_1.png "Charts")  
  
![Table](/docs/table_1.png "Table")  
  
  
## What do you need?  
- Tado thermostats (obviously)     
- NodeJS (min. v12.16)  

### Optional
- An InfluxDb Account

## Storage
There are 2 ways of storing data. **Locally** (will always be done) into a json file or into **InfluxDB**.   
Lately I found it extremely convenient
to store all my time-related data into influxdb, as with this, you can create dashboards without any coding and slice and dice data as you like.
If you're serious with data analysis (and you might have some IOT stuff running), you should give it a try. I for myself have installed InfluxDb on my server,
however you can create an account at [InfluxCloud](https://www.influxdata.com/). It's free, however you have the limitation that data older than 30 days will be removed, thus it might make sense for you to install 
Influx somewhere and store data there. Give it a try ;)

One note on influxdb, as this is extremely powerful, I'm not storing daily data, but hourly data into the database. You can rollup to hours if you want using the db internal queries.

### Influx Migration
If you want to import existing metrics into InfluxDB, you can do so by starting `node influxMigration.js`. Make sure you've setup your configuration file correctly.
  
## How to use  
- Clone this repository  
- go to /config and rename the example config to `config.json`  
- add your Tado username and password (see configuration settings for more...)  
- install dependencies by running `yarn` or `npm i`  
- run HeatSheet by running `yarn run start`  
  
Assuming your user and password is correct, HeatSheet will automagically detect it has never gotten any data, therefor it will run an initial migration. This might take a while, check the log output of Heatsheet.   
When it's done, goto `http://localhost:9999`, and enjoy all of your data. The data is stored in a file called `db.json` and obviously never transported to me or anybody else.   
Heatsheet will collect data on a daily basis, meaning shortly after midnight, it will collect the data for the previous day. If you've added a new thermostat, it will show up the day after automatically.
  
## Configuration  
The configuration file is located under ./config.   
  
```  
{  
	//these are the credentials you're using to log into the tado system
	"tado": { 
		//this is the username you're using to log into the tado app
		"tadoUser": "*your tado username*", 
		//this is the password you're using to log into the tado app		
		"tadoPassword": "*your tado password*" 
	}, 
	//these are the credentials you're using to log into the heatsheet ui
	"ui": { 
		//this is the username you're using to log into the ui
		"user": "admin",  
		//this is the password you're using to log into the ui		
		"password": "admin", 
		//this is the port, heatsheet's ui is reachable from your browser
		"apiPort": "9999",  
		//set this to false if you don't want to secure the ui. (ONLY DO THIS LOCALLY)		
		"loginNeeded": true
	},
	"storage": {
	    //if this is set to false, heatsheet will not fetch/record any data from Tado
        "dataRecording": true,
        //this is the configugration for influxdb. if set to fales, data is only storted locally
        "influxdb": {
          "enabled": false,
          "url": "https://someUrl.com:somePort",
          "token": "someToken",
          "org": "someOrganization",
          "bucket": "someBucket"
        }
    }
}  
```  
  
## Security
Make sure to change the ui user and password within your config.json! You might also want to change the port...

## Contribution
You've decided to contribute? Awesome! Please make sure to run the tests and the formatter before sending a pr. (Best is to use husky's pre-commit. Due to a weird husky issue, the pre-commit is only installed when you run `yarn --force`... 
