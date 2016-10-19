import {
    Component,
    OnInit,
    OnChanges,
    AfterViewInit,
    ViewChild, 
    ElementRef,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import * as $ from 'jquery';
import * as d3 from 'd3';

const styles = [require('./style.scss').toString()],
    template = require('./template.html');

import {PieInterface} from './pie.d';

/**
 * A component for entering a list of terms to be used with ngModel.
 */
@Component({
    selector: 'ng-viz-pie',
    directives: [],
    styles,
    template
})
export class Pie implements PieInterface, OnInit, OnChanges, AfterViewInit {
    @ViewChild('ngvizpie') container: ElementRef;

    @Input() data: any = [];
    @Input() height: number = 200;
    @Input() width: number = 200;
    @Input() ease: string = 'bounce';
    @Input() duration: number = 1000;
    @Input() selection: string = 'multi'; // multi|single|none
    @Input() colors: any = {
        start: '#007AFF',
        end: '#FFF500'
    };
    @Output() onSelection: EventEmitter<any> = new EventEmitter<any>();

    private categoricalColors: any;
    private oRadius: number;
    private iRadius: number;
    private _current: any;
    private svg: any;
    private pie: any;
    private pieContainer: any;
    private $tip: any;

    constructor() {
    }

    ngOnInit() {
        this._constructSvgContainer();
        this._constructPieLayout();
        this._constructPieContainer();
        this.setThickness();
        this.categoricalColors = this.getCategoricalColor();

        // Set up tooltip
        this.$tip = $('<div class="tooltip animated bounceIn" />').appendTo('body').hide();

        // Draw/Render Chart
        this._drawPieChart();
        this.render();
    }

    ngOnChanges() {
        if (this.pieContainer) {
            this.categoricalColors = this.getCategoricalColor();
            this.render();
        }
    }

    ngAfterViewInit() {
    }

    /***
     * Get categorical from range
     */
    getCategoricalColor() {
        let start:any = d3.rgb(this.colors.start);
        let end:any = d3.rgb(this.colors.end);
        let interpolateHcl:any = d3.interpolateHcl; 
        let length: number = this.data.length;
        return d3.scale.linear().domain([1,length])
        .interpolate(interpolateHcl)
        .range([start, end]);
    }
    
    /***
     * Construct svg container
     */
    _constructSvgContainer() {
        let container = this.container.nativeElement;
        this.svg = d3.select(container)
                    .append('svg')
                    .attr('height', this.height)
                    .attr('width', this.width);
    }

    /***
     * Construct default pie laoyut
     */
    _constructPieLayout() {
        this.pie = d3.layout.pie().value((d) => {
            let value: number = +d['value'];
            return value;
        }).sort(null);
    }

    /***
     * Generate svg arc
     */
    _arcGenerator() {
        let thickness = this.getThickness();
        let arc = d3.svg.arc()
        .outerRadius(thickness.oRadius)
        .innerRadius(thickness.iRadius);
        return arc;
    }

    /***
     * Construct pie chart container
     */
    _constructPieContainer() {
        let svg = this.svg;
        this.pieContainer = svg.append('g')
        .attr('transform', () => {
            let shiftWidth;
            shiftWidth = this.width / 2;
            return 'translate(' + shiftWidth + ',' + this.height / 2 + ')';
        })
    }

    /***
     * Draw pie chart
     */
    _drawPieChart() {
        // enter data and draw pie chart
        let g = this.pieContainer;
        let data = this.makeData(100);
        let pie = this.pie;
        let arc = this._arcGenerator();

        let path = g.datum(data).selectAll("path")
        .data(pie)
        .enter().append("path")
        .attr("class","piechart")
        .attr("fill", (d,i) => this.categoricalColors(i))
        .attr("d", <any>arc)
        .each(function(d){ this._current = d; });

        return path;
    }

    /***
     * Set the thickness of the inner and outer radii
     */
    setThickness() {
        let min = Math.min(this.width, this.height);
        this.oRadius =  min / 2 * 0.9;
        this.iRadius =  0;
    }

    /***
     * Get the thickness of the inner and outer radii
     */
    getThickness() {
        let oRadius = this.oRadius;
        let iRadius = this.iRadius;

        return {
            oRadius,
            iRadius
        };
    }

    /***
     * Check if all selected or not
     */
    isAllArcSelected() {
        let g = this.pieContainer;
        let data = this.data;
        let isSelected = true;
        g.datum(data).selectAll("path").each(function(d){
            if (!d.selected || d.selected === null) {
                isSelected = false;
                return;
            }
        });
        return isSelected;
    }

    /***
     * Reset chart to initial state
     */
    resetChart() {
        let g = this.pieContainer;
        let data = this.data;
        g.datum(data).selectAll("path").each(function(d){
            d3.select(this).style('opacity', 1);
            d.selected = null;
        });
    }

    /***
     * Toggle highlight 
     */
    toggleHighlight(selected: boolean, thickness: any, force?: boolean) {
        let self: any = this;
        let offset = selected ? 10 : 0;
        let arc = d3.svg.arc()
            .innerRadius(thickness.iRadius)
            .outerRadius(thickness.oRadius + offset);
        let isSelected = d3.select(self).data()[0].selected;
        if (!isSelected || force) {
            d3.select(self).transition()
            .duration(200)
            .attr("d", arc);
        }
    }

    /***
     * Renders the chart with tween animation
     */
    render() {
        let self = this;
        let g = this.pieContainer;
        let pie = this.pie;
        // generate new random data
        let data = this.data;
        let arc = this._arcGenerator();
        let thickness = this.getThickness();
        let arcTweenFill = function(a) {
            let i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) {
                let data: any = i(t);
                return arc(data);
            };
        };

        //Set up tooltip
        let $tip = this.$tip;

        let onMouseHover = function (event: any, value: string, data?: any) {
            if (value === 'enter') {
                $tip.text(`${data.data.label} : ${data.data.value}`).fadeIn(200);
                self.toggleHighlight.call(this, true, thickness);
                if (data.selected === false) {
                    d3.select(this).style('opacity', 1);
                } 
            } else if (value === 'move') {
                $tip.css({
                    top: event.pageY - 45,
                    left: event.pageX - $tip.width() / 2 - 15
                });
            } else if (value === 'leave') {
                $tip.hide();
                self.toggleHighlight.call(this, false, thickness);
                if (data.selected === false) {
                    d3.select(this).style('opacity', 0.2);
                } 
            }
        }

        let onClick = function (event: any, data?: any) {
            g.datum(data).selectAll("path").each(function(d){
                if (data.data.id !== d.data.id)  {
                    if (!d.selected) {
                        d.selected = false;
                        d3.select(this).style('opacity', 0.2);
                    }
                    if (d.selected && self.selection === 'single') {
                        d.selected = false;
                        d3.select(this).style('opacity', 0.2);
                        self.toggleHighlight.call(this, false, thickness, true);
                    }
                } else {
                    d.selected = !d.selected;
                    if (d.selected) {
                        self.toggleHighlight.call(this, true, thickness, true);
                        d3.select(this).style('opacity', 1);
                    } else {
                        self.toggleHighlight.call(this, true, thickness, false);
                        d3.select(this).style('opacity', 0.2);
                    }
                    
                }                
            });
            let selections = g.datum(data).selectAll("path").data().map((selection) => {
                let data = selection.data;
                data.selected = selection.selected;
                return data;
            });
            self.onSelection.emit(selections);
        }

        // add transition to new path
        g.datum(data).selectAll("path")
            .data(pie)
            .transition()
            .ease(this.ease)
            .duration(this.duration)
            .attrTween("d", arcTweenFill)
            .each('start',function(d){ 
                d.outerRadius = thickness.oRadius - 20;
                d.selected = null;
             })
            .each('end',  function(d){
                let context = this;
                if (d.data.selected !== undefined) {
                    d.selected = d.data.selected;
                    if (d.data.selected) {
                        self.toggleHighlight.call(this, true, thickness, true);
                        d3.select(this).style('opacity', 1);
                    } else {
                        d3.select(this).style('opacity', 0.2);
                    }
                }

                $(this).off('mouseover').on('mouseover', function (event) {
                    onMouseHover.call(context, event, 'enter', d);
                });
                $(this).off('mouseout').on('mouseout', function (event) {
                    onMouseHover.call(context, event, 'leave', d);
                });
                $(this).off('mousemove').on('mousemove', function (event) {
                    onMouseHover.call(context, event, 'move');
                });
                if (self.selection !== 'none') {
                    $(this).off('click').on('click', function (event) {
                        onClick.call(context, event, d);
                    });
                }
             });
            
        // add any new paths
        g.datum(data).selectAll("path")
            .data(pie)
            .enter().append("path")
            .attr("class","piechart")
            .attr("fill", (d,i) => this.categoricalColors(i))
            .attr("d", <any>arc)
            .each(function(d){ 
                this._current = d;
            });
        // remove data not being used
        g.datum(data).selectAll("path")
            .data(pie)
            .exit().remove();
    }

    /***
     * Create mock data
     */
    makeData(size){
        return d3.range(size).map((item) => {
            return {
               label: '',
               value: Math.random()*100 
            };
        });
    }


}
