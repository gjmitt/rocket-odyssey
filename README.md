# Rocket Odyssey

## Dependencies
At the top of index.js are flags to allow using test APIs. See Test Mode section below.<br>
If using test mode, you will need json server https://www.npmjs.com/package/json-server 
which can be installed with npm:<br>
% npm i json-server

## APIs
Two APIs are used: Launch Library 2 for Astronauts and SpaceX for Rockets, Boosters (cores), and Capsules.  SpaceX only lists astronauts qualified on SpaceX rockets, and although technically incorrect (for space travel) it's more fun for picking astronauts to have a larger list. 

### Launch Library 2   
API Documentation:<br>
https://thespacedevs.com/llapi

Endpoints:<br>
Filter for Active and American astronauts.<br>
https://ll.thespacedevs.com/2.2.0/astronaut/?format=json&active=1&nationality=American&ordering=name&limit=100

For development testing - this endpoint has stale data but is not subject to any rate limits.<br>
Only difference in URL is "lldev".<br>
https://lldev.thespacedevs.com/2.2.0/astronaut/?format=json&active=1&nationality=American&ordering=name&limit=100

### SpaceX
API Documentation:<br>
https://github.com/r-spacex/SpaceX-API/blob/master/docs/README.md

Endpoints:<br>
https://api.spacexdata.com/v4/<br>
  capsules<br>
  dragons<br>
  rockets<br>
  cores<br>

## Test Mode
Test mode is used to avoid 429 errors "Too many requests" (rate limiting).<br>
If you are using test mode, make sure to start your json server:<br>
json-server --watch rocket-odyssey-test.json

## Limitations
Rocket Odyssey attempts to convey a realistic experience assembling a space rocket mission. In some cases the data from the APIs has been adjusted for practical purposes. For example, the Rockets selection excludes Falcon 1 by selecting only rockets with 1st stages that are reusable, which was the only way to exclude Falcon 1 but include Starship. Startship ends up being included, even though it is not ready yet for flight, but provides an interesting level of excitement. Starship is kind of a hybrid vehicle and in the real world requires a Falcon Heavy to launch, but for simplicity, this app does not require the Falcon Heavy rocket for Starship. Astronauts are limited to nationality = "American" to keep the list shorter.

