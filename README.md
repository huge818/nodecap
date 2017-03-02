
Description
===========

A cross-platform binding for performing packet capturing with [node.js](http://nodejs.org/).

Requirements
============

* [node.js](http://nodejs.org/) -- v0.12.18 or older (you can build it on latest nodejs)

* For Windows: [WinPcap](http://www.winpcap.org/install/default.htm)

* For *nix: libpcap and libpcap-dev/libpcap-devel packages


Install
============

    npm install nodecap


Examples
========

* Send an arbitrary packet: An arp request for example

```javascript
var nodecap=require('nodecap');
var Cap =  new nodecap();
var buffer = new Buffer ([
    // ETHERNET
    //...
]);

try {
  // send will not work if pcap_sendpacket is not supported by underlying `device`
  c.sendBufer(buffer);
} catch (e) {
  console.log("Error sending packet:", e);
}

```

* List all network devices:

API
===

Cap events
----------

* **capture**(< _integer_ >nbytes, < _boolean_ >truncated) - A packet `nbytes` in size was captured. `truncated` indicates if the entire packet did not fit inside the _Buffer_ supplied to open().


nodecap methods
-----------
sendBufer   
close

