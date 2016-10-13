import { Component } from '@angular/core';
import { NgVizPie } from '../../src/component';

@Component({
    selector: 'app',
    directives: [NgVizPie],
    template: require('./home.html')
})

export class App {
    constructor() {

    }

    ngOnInit() {

    }
}
