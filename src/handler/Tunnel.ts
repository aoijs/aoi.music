import internal from "stream";

class Tunnel extends internal.Transform {
  resource?: any;
  constructor(resource: any) {
    super();
    this.resource = resource;
  }
}
