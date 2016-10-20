import { Component } from '@angular/core';
import { Pie } from '../../src/charts/pie/pie';
import { Donut } from '../../src/charts/donut/donut';
import { Number } from '../../src/charts/number/number';
import * as d3 from 'd3';

@Component({
    selector: 'app',
    directives: [Pie, Donut, Number],
    template: require('./home.html')
})

export class App {
    pieData: any = [{
        id: 1,
        label: 'Sydney',
        value: 200,
        selected: true
    }, {
        id: 2,
        label: 'Canberra',
        value: 100,
        selected: false
    }, {
        id: 3,
        label: 'Melbourne',
        value: 250,
        selected: false
    }, {
        id: 4,
        label: 'Tasmania',
        value: 40,
        selected: false
    }, {
        id: 5,
        label: 'Queesland',
        value: 400,
        selected: false
    }];

    donutData: any = [{
        id: 1,
        label: 'Sydney',
        value: 200
    }, {
        id: 2,
        label: 'Canberra',
        value: 100
    }, {
        id: 3,
        label: 'Melbourne',
        value: 250
    }, {
        id: 4,
        label: 'Tasmania',
        value: 40
    }, {
        id: 5,
        label: 'Queesland',
        value: 400
    }];

    numberData: any = [{
        id: 1,
        label: 'Sydney',
        value: 20000
    }, {
        id: 2,
        label: 'Canberra',
        value: 1000
    }, {
        id: 3,
        label: 'New England',
        value: 10000
    }]

    constructor() {

    }

    ngOnInit() {
        let self = this;
        setTimeout(function () {
            self.pieData = [{
                id: 1,
                label: 'Sydney',
                value: 200,
                selected: false
            }, {
                id: 2,
                label: 'Canberra',
                value: 100,
                selected: false
            }, {
                id: 3,
                label: 'Melbourne',
                value: 250,
                selected: true
            }, {
                id: 4,
                label: 'Tasmania',
                value: 40,  
                selected: false
            }, {
                id: 5,
                label: 'Queesland',
                value: 400,
                selected: false
            }];
        }, 2000);
    }
}
