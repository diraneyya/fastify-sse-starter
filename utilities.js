export class SseEventDispatcher {
    #clients = [];
  
    #isSseStreamReadable(reply) {
      let sseProp = Object.getOwnPropertySymbols(reply)
        .find(sym => sym.toString() === 'Symbol(sse)');
      
      return (sseProp !== undefined && reply[sseProp]?.stream?.readable === true);
    }
  
    dispatch(event) {
      this.#clients = this.#clients.filter(reply => {
        if (!this.#isSseStreamReadable(reply)) 
          return false;
          
        reply.sse(event);
        return true;
      });
    }
  
    get length() {
      return this.#clients.length;
    }
  
    connect(reply) {
      this.#clients.unshift(reply);
      // Send the first data
      reply.sse('STREAM_STARTED', {});
    }
  }
  