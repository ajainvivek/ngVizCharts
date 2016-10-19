import {
    tick,
    ComponentFixture,
    TestComponentBuilder,
    inject,
    addProviders,
    fakeAsync
} from '@angular/core/testing';

import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

// Load the implementations that should be tested
import {Donut} from './donut';

describe('Donut', () => {
    let builder: TestComponentBuilder;

    beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => builder = tcb));

    describe('when the controller is instantiated', () => {
        it('has its properties defined', () => {
            builder.createAsync(TestApp).then((fixture: ComponentFixture<TestApp>) => {
                const component = fixture.debugElement.query(By.directive(Donut)).componentInstance;
                expect(component.helloWorld).toBeDefined();
            });
        });
    });
});

@Component({
    selector: 'test-app',
    template: `<ng-viz-donut></ng-viz-donut>`,
    directives: [Donut]
})
class TestApp {
    ngOnInit() {

    }
}
