/**
 * finds the extents of the input svg
 * the extent is 0 to the max length of the datasets
 */
const findTimeExtents = 
R.compose(
    d3.extent,
    R.flip(R.append)([0]),
    R.reduce(R.max, -Infinity),
    R.map(R.length)
)

/**
 * finds the extents of the input svg for the axis
 * if the axis is x, the extent is 0 to the max length of the datasets
 * if the axis is not x, it is y, 
 * and the extent is the minimum to maximum values of all the datasets
 */
const findDataExtents =
func =>
R.compose(
    d3.extent,
    R.map(func),
    R.reduce(R.concat,[]),
    R.filter(d=>d!=null)
)

/**
 * returns the axis for the domain and range
 */
const findAxis = 
(dom, ran) =>
    d3.scaleLinear()
            .domain(dom)
            .range(ran)

/**
 * returns the x and y values for the dot
 * corresponding to the particular slider[i]
 */
const calcDotCoordinates =
i => 
    {
        let xVal = $(`#${sliders[i]}`).val()
        let ret

        if($('#dimension').val() == 1)
        {
            ret = {
                x: xVal,
                y: currentData[i][xVal].y
            }
        }
        else
        {
            ret = {
                x: currentData[i][xVal].x,
                y: currentData[i][xVal].y
            }
        }
        
        return ret
    }

/**
 * statistical data for box plots
 */
const calc_box_data = 
data => 
    { 
        let m = 
            R.compose
                (
                    R.mean,
                )
                (data)
        
        let sd = 
            R.compose
                (
                    Math.sqrt,
                    R.mean,
                    R.map(d=>R.multiply(d-m,d-m))
                )
                (data)
    
        let mn = R.reduce(R.min, Infinity, data)
            mx = R.reduce(R.max, -Infinity, data)
    
        return {
            mean: m,
            std_dev: sd,
            min: mn,
            max: mx
        }
    }

const euclideanDistance2D = 
(point1, point2) =>
{
    let a = point2.x - point1.x,
        b = point2.y - point1.y

    return Math.sqrt(a*a + b*b)
}

/**
 * perform setup calculations for d3 svg
 */
const d3Setup = 
(chartName, data=null, setup=true) =>
    {
        let xExtent, yExtent

        let chartSvg = d3.select(chartName)

        let svgWidth = +chartSvg.attr('width'),
            svgHeight = +chartSvg.attr('height')

        let chartWidth = svgWidth - (margin.left + margin.right),
            chartHeight = svgHeight - (margin.top + margin.bottom)

        if(R.equals(chartName,'#chart'))
        {
            if($('#dimension').val() == 1)
            {
                xExtent = findTimeExtents(currentData)
            }
            else{
                xExtent = 
                    findDataExtents
                        (d=>d.x)
                        (currentData)
            }
            
            yExtent = 
                findDataExtents
                    (d=>d.y)
                    (currentData)

            cWidth = chartWidth
            cHeight = chartHeight

            let xAxis = 
                    findAxis
                        (
                            xExtent,
                            [0,chartWidth]
                        ),
                yAxis =
                    findAxis
                        (
                            yExtent,
                            [chartHeight,0]
                        )

            currentChartXExtent = xExtent
            currentChartYExtent = yExtent
            currentChartXAxis = xAxis
            currentChartYAxis = yAxis
        }
        else if(R.contains('#face',chartName))
        {
            xExtent = d3.extent(data.map(e => e.x))
            yExtent = d3.extent(data.map(e => e.y))

            let xAxis = 
                    findAxis
                        (
                            xExtent,
                            [0,chartWidth]
                        ),
                yAxis =
                    findAxis
                        (
                            yExtent,
                            [chartHeight,0]
                        )

            currentFaceXAxis = xAxis
            currentFaceYAxis = yAxis
        }
        else if(R.contains('#plot',chartName))
        {
            xExtent = [0,1]
            yExtent = 
                findDataExtents(d=>d.y)(currentData)

            let xAxis = 
                    findAxis
                        (
                            xExtent,
                            [0,chartWidth]
                        ),
                yAxis =
                    findAxis
                        (
                            yExtent,
                            [chartHeight,0]
                        )

            currentPlotXExtent = xExtent
            if(setup) currentPlotYExtent = yExtent
            currentPlotXAxis = xAxis
            if(setup) currentPlotYAxis = yAxis
        }
        else if(R.contains('#pdiag', chartName))
        {
            data = [].concat.apply([], data)
            //xMax = d3.max(data.map(e => e.x))
            xExtent = [0,60]
            yExtent = xExtent

            let xAxis = 
                    findAxis
                        (
                            xExtent,
                            [0,115]
                        ),
                yAxis =
                    findAxis
                        (
                            yExtent,
                            [115,0]
                        )
                    
            currentPDiagXAxis = xAxis
            currentPDiagYAxis = yAxis
        }

        return chartSvg
    }