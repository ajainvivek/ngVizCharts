import {
    Component,
    OnInit
} from '@angular/core';

const styles = [require('./style.scss').toString()],
    template = require('./template.html');

import {PieInterface} from './component.d';

/**
 * A component for entering a list of terms to be used with ngModel.
 */
@Component({
    moduleId: module.id,
    selector: 'ng-viz-pie',
    directives: [],
    styles,
    template
})
export class Pie implements PieInterface, OnInit {

    public helloWorld(): string {
        return 'Hello World';
    }

    ngOnInit() {

    }
}
