// Minimal Angular core shim for running Cucumber/ts-node against Angular code without loading Angular ESM packages.

export type ClassDecoratorFactory = (target: Function) => void;
export type PropDecoratorFactory = (target: Object, propertyKey: string | symbol) => void;
export type MethodDecoratorFactory = (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void;

function noop(): void {}

// No-op class decorator
export function Injectable(_opts?: any): ClassDecorator {
  return function (_target: Function) {
    // no-op
  };
}

/* No-op Component decorator */
export function Component(_opts?: any): ClassDecorator {
  return function (_target: Function) {
    // no-op
  };
}

/* No-op Directive decorator */
export function Directive(_opts?: any): ClassDecorator {
  return function (_target: Function) {
    // no-op
  };
}

// Common property decorators (no-op)
export function Input(_binding?: any): PropertyDecorator {
  return function (_target: Object, _propertyKey: string | symbol) {
    // no-op
  };
}

export function ViewChild(_selector: any, _opts?: any): PropertyDecorator {
  return function (_target: Object, _propertyKey: string | symbol) {
    // no-op
  };
}

// Method decorator (no-op)
export function HostListener(_eventName: string, _args?: string[]): MethodDecorator {
  return function (_target: Object, _propertyKey: string | symbol, _descriptor: PropertyDescriptor) {
    // no-op
  };
}

// Common Angular types used by the codebase
export class ElementRef<T = any> {
  constructor(public nativeElement?: T) {}
}

export interface AfterViewInit {
  ngAfterViewInit(): void;
}

export type SimpleChange = any;
export interface SimpleChanges {
  [propName: string]: SimpleChange;
}

// Also export NgModule symbol used elsewhere just in case
export function NgModule(_meta: any): ClassDecorator {
  return function (_target: Function) {
    // no-op
  };
}
