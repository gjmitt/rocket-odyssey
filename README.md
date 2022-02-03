# README.md
start your server

in your browser, any endpoint to test
http://localhost:3000/launches

## APIs
Two APIs are used: Launch Library 2 for Astronauts and SpaceX for Rockets, Boosters (cores), and Capsules.  SpaceX only lists astronauts qualified on SpaceX rockets, and although technically incorrect (for space travel) it's more fun for picking astronauts to have a larger list. 

### Launch Library 2   
API Documentation:
https://thespacedevs.com/llapi

Endpoints:
Filter for Active and American astronauts.
https://ll.thespacedevs.com/2.2.0/astronaut/?format=json&active=1&nationality=American&ordering=name&limit=100

For development testing - this endpoint has stale data but is not subject to any rate limits.
Only difference in URL is "lldev".
https://lldev.thespacedevs.com/2.2.0/astronaut/?format=json&active=1&nationality=American&ordering=name&limit=100


### SpaceX
API Documentation:
https://github.com/r-spacex/SpaceX-API/blob/master/docs/README.md

Endpoints:
https://api.spacexdata.com/v4/
  capsules
  dragons
  rockets

### Test Mode
Test mode is used to avoid 429 errors "Too many requests" (rate limiting).
If you are using test mode, make sure to start your json server:
json-server --watch rocket-odyssey-test.json

## Limitations
To the greatest extent possible Rocket Odyssey attempts to provide a realistic tool for assembling a space rocket mission. In some cases the data from the APIs has been adjusted for practical purposes. For example, the Rockets selection excludes Falcon 1 by selecting only rockets with 1st stages that are reusable, which was the only way to exclude Falcon 1 but include Starship. Startship ends up being included, even though it is not ready yet for flight, but provides an interesting level of excitement. LSO, Starship is kind of a hybrid vehicle and in the real world requires a Falcon Heavy to launch, but for simplicity, this app does not require the Falcon Heavy rocket for Starship. Astronauts are limited to nationality = "American" to keep the list shorter.

