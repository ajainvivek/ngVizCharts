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
import * as d3 from 'd3';
import * as accounting from 'accounting';
import * as $ from 'jquery';

const styles = [require('./style.scss').toString()],
    template = require('./template.html');

import {NumberInterface} from './number.d';

/**
 * A component for entering a list of terms to be used with ngModel.
 */
@Component({
    selector: 'ng-viz-number',
    directives: [],
    styles,
    template
})
export class Number implements NumberInterface, OnInit, OnChanges {

    @ViewChild('ngviznumber') container: ElementRef;

    @Input() colors: any = {
        start: '#007AFF',
        end: '#FFF500'
    };
    @Input() data: any;
    @Input() fontSize: number = 25;
    @Input() display: string = 'vertical'; // vertical|horizontal
    @Input() padding: number = 10;
    @Input() prefix: string = '';
    @Input() suffix: string = '';
    @Input() duration: number = 3000;
    @Input() wrapLabel: boolean = true;
    @Input() hover: boolean = true;
    @Output() onHover: EventEmitter<any> = new EventEmitter<any>();

    private svg: any;
    private height: number = 200;
    private width: number = 200;
    private categoricalColors: any;
    private $tip: any;
    
    ngOnInit() {
        this._constructSvgContainer();
        this.categoricalColors = this.getCategoricalColor();

        // Set up tooltip
        this.$tip = $(`<div class='tooltip animated bounceIn' />`).appendTo('body').hide();

        this.render();
    }

    ngOnChanges() {

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
        let data = this.data;
        let dimensions = this.getContentsDimension(data);
        
        if (this.display === 'vertical') {
            let maxWidth = this.getMaxWidth(data) + 10;
            this.height = (dimensions.height + this.padding) * data.length + 15;
            this.width = maxWidth + this.padding;
        } else {
            this.height = (dimensions.height + this.padding + 15) * 2;
            this.width = (dimensions.width + (this.padding * data.length)) + 10;
        }
        
        this.svg = d3.select(container)
                    .append('svg')
                    .attr('height', this.height)
                    .attr('width', this.width);
    }

    /***
     * Tween numbers
     */
    tweenNumber(text:number, d: any, context: any) {
        let currentContent = text;
        let label = (context.wrapLabel) ? d.label : '';
        let i = d3.interpolate(currentContent, d.value),
            prec = (d + '').split('.'),
            round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

        return function(t) {
            this.textContent = `${label} ${context.prefix}${Math.round(i(t) * round) / round}${context.suffix}`;
        };
    }

    /***
     * Get max width from array of data
     */
    getMaxWidth(data: any) {
        let widths = [];
        data.forEach((item) => {
            widths.push(this.getContentDimension(item).width);
        })
        return Math.max(...widths);
    }

    /***
     * Get contents total dimension
     */
    getContentsDimension(data: any) {
        let width: number = 0;
        let height: number = 0;
        data.forEach((item) => {
            width += this.getContentDimension(item).width;
            height = this.getContentDimension(item).height;
        })
        return {
            width,
            height
        };
    }

    /***
     * Get content dimension 
     */
    getContentDimension(data: any) {
        let $container = $(this.container.nativeElement);
        let $div =$(`<span class='hidden'></span>`);
        let fontSize = this.fontSize;
        let label = (this.wrapLabel) ? data.label : '';
        $div.text(`${label} ${this.prefix}${data.value}${this.suffix}`);
        $div.css({
            fontSize: fontSize
        });
        $container.append($div);
        let dimensions = {
            width: $div.width(),
            height: $div.height()
        };
        $div.remove();
        return dimensions;
    }

    /***
     * Toggle highlight for group of numbers
     */
    toggleHighlight(data: any, highlight: boolean) {
        if (highlight) {
            this.svg.selectAll('.numberchart').attr('class', (d) => {
                if (data.id !== d.id) {
                    return 'numberchart highlight';
                } else {
                    return 'numberchart';
                } 
            });
        } else {
            this.svg.selectAll('.numberchart').attr('class', 'numberchart');
        }
    }

    /***
     * On mouse hover perform selection
     */
    onMouseHover(event: any, value: string, context?: any, data?: any) {
        let $tip = context.hover ? context.$tip : false;
        if (value === 'enter') {
            data.selected = true;
            context.onHover.emit(data); // Emit hover data
            if ($tip) {
                $tip.text(`${data.label} : ${data.value}`).fadeIn(200);
            }
        } else if (value === 'move') {
            if ($tip) {
                $tip.css({
                    top: event.pageY - 45,
                    left: event.pageX - $tip.width() / 2 - 15
                });
            }
        } else if (value === 'leave') {
            data.selected = false;
            if ($tip) {
                $tip.hide();
            }
        }
    }

    /***
     * Render the number 
     */
    render() {
        let self = this;
        let data = this.data;
        let start_val = 0;
        let dimensions = this.getContentsDimension(data);
        let prevDimension;

        this.svg.selectAll('.numberchart')
            .data(this.data)
            .enter()
            .append('text')
            .text(start_val)
            .attr('class', 'numberchart')
            .attr('fill', (d,i) => this.categoricalColors(i))
            .attr('font-size', this.fontSize)
            .attr('x', function(d, i) {
                let x;
                let counter = prevDimension ? 1 : 0;
                if (self.display === 'vertical') {
                    x = self.padding;
                } else {
                    x = (prevDimension ? prevDimension.width : 0 * counter) + (self.padding * (i + 1)) ;
                }
                prevDimension = {
                    height: prevDimension ? prevDimension.height + self.getContentDimension.call(self, d).height : self.getContentDimension(d).height,
                    width: prevDimension ? prevDimension.width + self.getContentDimension.call(self, d).width : self.getContentDimension(d).width
                };
                return x;
            })
            .attr('y', function(d, i) {
                let y;
                if (self.display === 'vertical') {
                    let padding = i > 0 ? self.padding * i : 0;
                    y = ((i + 1) * dimensions.height) + padding;
                } else {
                    y = self.padding + dimensions.height - 10;
                }
                return y;
            })
            .transition()
            .duration(this.duration)
            .tween('text', function(d) {
                return self.tweenNumber.call(this, this.textContent, d, self);
            }).each('end', function (d) {
                let context = this;
                $(this).off('mouseover').on('mouseover', function (event) {
                    self.toggleHighlight(d, true);
                    self.onMouseHover.call(context, event, 'enter', self, d);
                });
                $(this).off('mouseout').on('mouseout', function (event) {
                    self.toggleHighlight(d, false);
                    self.onMouseHover.call(context, event, 'leave', self, d);
                });
                $(this).off('mousemove').on('mousemove', function (event) {
                    self.onMouseHover.call(context, event, 'move', self);
                });
            }); 
    }

}