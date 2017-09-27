

var Cap = require('cap').Cap;
var decoders = require('cap').decoders;
var PROTOCOL = decoders.PROTOCOL;


 Buffer.prototype.subArr=function(n,L){
 	return this.slice(n,n+L);
 }

var nodecap=function(){
	var self=this;

	this.protocol={
		"udp":PROTOCOL.IP.UDP,
		"tcp":PROTOCOL.IP.TCP,
		"SCTP":PROTOCOL.IP.SCTP
	};

	/**
	 * [capture 开始捕获]
	 * @param  {[type]}   obj [捕获参数]
	 * @param  {Function} fn  [回调]
	 */
	 this.capture=function(obj,fn){
		var Caper = new Cap();
		var device = Cap.findDevice(obj.device);
		if(!device){
			console.log("device不正确");
			return;
		}
		var filter = obj.filter;
		var bufSize = 10 * 1024 * 1024;
		var buffer = new Buffer(65535);
		var linkType = Caper.open(device, filter, bufSize, buffer);
		Caper.setMinBytes && Caper.setMinBytes(0);
		//console.log("Caper",Caper);
		var N=0;
		Caper.on('packet', function(nbytes, trunc) {
			if(linkType !== 'ETHERNET'){
				console.log("非以太网数据包");
				return;
			}

			var ret = decoders.Ethernet(buffer);
			if(ret.info.type !== PROTOCOL.ETHERNET.IPV4){
				console.log("IPV6");
				return;
			}
			ret = decoders.IPV4(buffer, ret.offset);
			var resdata={
				linkType:linkType,
				ipType:ret.info.type,
				rawData:buffer.slice(0, nbytes),
				srcaddr:ret.info.srcaddr,
				dstaddr:ret.info.dstaddr,
				srcport:ret.info.srcport,
				dstport:ret.info.dstport,
				ret:ret,
				//RAWPROTOCOL:PROTOCOL
			};

			if (ret.info.protocol === PROTOCOL.IP.TCP) {
				var datalen = ret.info.totallen - ret.hdrlen;
				ret = decoders.TCP(buffer, ret.offset);
				datalen -= ret.hdrlen;
				resdata.dataLength=datalen;
				resdata.protocol="tcp";
				resdata.srcport=ret.info.srcport;
				resdata.dstport=ret.info.dstport;
				var rawData=buffer.slice(0, nbytes).toString("hex");
				if(N==0){
					/*
					console.log(0,buffer.subArr(0, 6).toString("hex")); // 目的mac地址 
					console.log(1,buffer.subArr(6, 6).toString("hex"));  // 源mac地址 
					console.log(2,buffer.subArr(12,2));  // 类型 
					console.log(3,buffer.subArr(14,12));  // 版本长度，标识等。。。
					console.log(4,buffer.subArr(26,4).toString("hex"));  // 32位源IP 
					console.log(5,buffer.subArr(30,4).toString("hex"));  // 32位目的IP 
					console.log("ret.info",ret.info);
					*/
				}
				resdata.destmac=buffer.subArr(0, 6).toString("hex");
				resdata.sourcemac=buffer.subArr(6, 6).toString("hex");
				resdata.destip=buffer.subArr(30,4).toString("hex");
				resdata.sourceip=buffer.subArr(26,4).toString("hex");
				fn&&fn(resdata);
				return;
			}

			if(ret.info.protocol === PROTOCOL.IP.UDP) {
				ret = decoders.UDP(buffer, ret.offset);
				resdata.protocol="udp";
				fn&&fn(resdata);
				return;
			} 
			var protocol=PROTOCOL.IP[ret.info.protocol];
			console.log('暂不支持的IPv4协议: ' + protocol);
			N++;
		});
		self.Caper=Caper;
	 }

	 this.sendBufer=function(bufer,fn){
		try {
		  self.Caper.send(buffer, buffer.length);
		  fn&&fn();
		} catch (e) {
		  console.log("Error", e);
		}
	 }

	 /**
	  * [close 停止捕获]
	  */
	 this.close=function(fn){
		if(self.Caper){
			 self.Caper.close();
			 fn&&fn();
		}
	 }
}

module.exports = nodecap;
