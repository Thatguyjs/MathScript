// The MathScript event system

const Main = {
	threads: {},
	listeners: {},

	tickId: null,
	tickPaused: false
};


// Default thread class
class Thread {
	constructor(name) {
		this.name = name;
		this.listeners = {};
		this.events = [];
	}

	do(event, data) {
		if(this.listeners[event]) {
			this.listeners[event](data);
		}
	}

	on(event, callback) {
		this.listeners[event] = callback;
	}
}


// Create default threads
Main.addThread = function(name) {
	this.threads[name] = new Thread(name);

	this.do('add-thread', this.threads[name]);
}


// Get a thread
Main.get = function(name) {
	return this.threads[name] || console.error(`Thread \"${name}\" does not exist`);
}


// Add event to a specific thread
Main.addEvent = function(thread, name, data) {
	let event = { name: name, data: data };
	this.threads[thread].events.unshift(event);

	this.threads[thread].do('add-event', event);
	this.do('add-event', event);
}


// Pause the `tick` event
Main.pause = function() {
	this.tickPaused = true;
}

// Resume the `tick` event
Main.resume = function() {
	this.tickPaused = false;
}


// Call a listener for `event`
Main.do = function(event, data) {
	if(this.listeners[event]) {
		this.listeners[event](data);
	}
}


// Add listener
Main.on = function(event, callback) {
	if(event === 'tick') {
		this.tickId = setInterval(this.tick, 0);
	}

	this.listeners[event] = callback;
}


// Remove listener
Main.remove = function(event) {
	if(event === 'tick') {
		clearInterval(this.tickId);
	}

	delete this.listeners[event];
}


// Main timer
Main.tick = function() {
	if(Main.listeners.tick && !Main.tickPaused) {
		Main.listeners.tick();
	}
}


module.exports = Main;
