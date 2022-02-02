# README.md
start your server
% json-server --watch rocket-odyssey-test.json

in your browser, any endpoint to test
http://localhost:3000/launches

## APIs
The Space Devs Launch Library 2   
  https://thespacedevs.com/llapi
Please use https://lldev.thespacedevs.com for development testing - this endpoint has stale data but is not subject to any rate limits.
API Documentation: 
  https://ll.thespacedevs.com/2.2.0/astronaut/

SpaceX
We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with Space Exploration Technologies Corp (SpaceX), or any of its subsidiaries or its affiliates.
API Documentation:
  https://github.com/r-spacex/SpaceX-API/blob/master/docs/README.md
Endpoints:
  https://api.spacexdata.com/v4/
    capsules
    dragons
    rockets
    ships

## Limitations
To the greatest extent possible Rocket Odyssey attempts to provide a realistic tool for assembling a space rocket mission. In some cases the data from the APIs has been adjusted for practical purposes. For example, the Rockets selection excludes Falcon 1 by selecting only rockets with 1st stages that are reusable, which was the only way to exclude Falcon 1 but include Starship. Startship ends up being included, even though it is not ready yet for flight, but provides an intereting level of excitement.

