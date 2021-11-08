import PlayerQueue from "../../structures/Queue";
import Player from "../../structures/Player";

export function decorateMethod(func: (method: any, ...args: any[]) => any) {
    return function decorate(_0: any, _1: any, descriptor: PropertyDescriptor): PropertyDescriptor {
      const method = descriptor.value
      descriptor.value = function (...args: any[]) {
        return func.apply(this, [method.bind(this), ...args])
      }
      return descriptor
    }
  }

export namespace Queue {
    export function validatePlayer(): (...args: any[]) => any {
        return decorateMethod(function(this: PlayerQueue, func, player) {
            const error = new TypeError(`Argument "player" must be present and a instance of Player`);

            if (! (player instanceof Player))
                throw error;
            return func(player);
        })
    }
}