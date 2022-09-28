export class SseEventDispatcher {
    // Private property: stores a dynamic array to connected clients
    // An item in this array is a reply object in Fastify.
    // (https://www.fastify.io/docs/latest/Reference/Reply/)
    #clients = [];
  
    // This private method sneaks into the "hidden" symbol property
    // of the reply object which hides the inner details of the SSE
    // plugin including the stream and whether it is still readable.
    // This code was written by reverse-engineering the reply object
    // in the debugger.
    #isSseStreamReadable(reply) {
      let sseProp = Object.getOwnPropertySymbols(reply)
        .find(sym => sym.toString() === 'Symbol(sse)');
      
      return (sseProp !== undefined && reply[sseProp]?.stream?.readable === true);
    }
  
    // The main method of this class. Dispatches an event string to
    // all connected clients and removes disconnected ones from the
    // clients array using the Array.prototype.filter method.
    dispatch(event) {
      this.#clients = this.#clients.filter(reply => {
        if (!this.#isSseStreamReadable(reply)) 
          return false;
          
        reply.sse(event);
        return true;
      });
    }
  
    // Returns the number of active connections, note that this count
    // is only accurate immediately after calling "dispatch".
    get connections() {
      return this.#clients.length;
    }
  
    // Adds a new connection when the SSE endpoint is invoked. Pass the
    // Fastify reply object to this method.
    connect(reply) {
      this.#clients.unshift(reply);
      // Send the first data, which contains the options (check the docs)
      reply.sse('STREAM_STARTED', {});
    }
  }
  