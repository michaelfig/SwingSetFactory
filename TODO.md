
* Support Cosmos Validator (N instances) as a Vat Machine type
* Provide persistent vs. ephemeral SwingSets.  Try before you buy, buy it.
* Add quotas to the number of Vat Machines you can launch
* Kill off your workers when your browser drops the (WebSocket) connection.
* Pretty up the UI (currently a sucky React app)
* Assign a random stable name to the Vat Machine.
* Add the ability for the API to report the kernel and mailbox state to the UI after every turn.
* Have the UI save that state in IndexedDB.
* Allow the virtual resumption of terminated Vat Machines (by having the UI pass the state of the Vat Machine back into the API server, along with proof that you own a given stable name, and thereby relaunch the instance)
* Have a saved-state explorer, where you can edit the state without taking down the vat
* Provide an upload interface to allow the browser to specify custom bootstrap to use.
* Provide a nice message injection mechanism
* Connect the blockchain solo vat machine as an option for launching (once you've validated that your code behaves the way you like with the generic vat machine)
