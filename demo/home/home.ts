import { Component } from '@angular/core';
import { Pie } from '../../src/component';

@Component({
    selector: 'app',
    directives: [Pie],
    template: require('./home.html')
})

export class App {
    constructor() {

    }

    ngOnInit() {

    }
}
