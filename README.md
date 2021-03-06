# Steam Sales Watcher
## V3.11
### Last tested: 07/13/2018

This JS app grabs your wishlist page from Steam, and shows available promotions from other web-sites.
Then you can sort by price / discount or name.

*You need a Steam ID and to make your wishlist public to make it work.*

Demo: [https://jck-interactive.com/steamsaleswatcher](https://jck-interactive.com/steamsaleswatcher)

![Screenshot](https://jck-interactive.com/steamsaleswatcher/screenshot.png)

It uses:
* EnhancedSteam (API v3)
* cors-anywhere.herokuapp.com to get the Steam wishlist page
* Boostrap 3
* jQuery

Next versions will allow to choose the stores you want before gathering data. For now you can do that by editing App.js.

Since EnhancedSteam and Steam regularly update their APIs and websites, I do not guarantee that this App will continue to work in time (Before I put this project on GitHub, I had to modify it twice).

## Installation:
Copy files to your server or localhost.
