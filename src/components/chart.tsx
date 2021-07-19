import React, { useEffect, useReducer } from 'react';
import { Provider, useQuery } from 'urql';
import moment from 'moment';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { client } from '../Features/Weather/Weather';
import { reducer } from './dashboard';

const MESUREMENTS_QUERY = `
    query MESUREMENTS_QUERY($input: [MeasurementQuery]) {
        getMultipleMeasurements(input: $input) {
            metric
            measurements {
                metric
                at
                value
                unit
            }
        }
    }
`;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        customTooltip: {
        backgroundColor: '#f2f2f2',
        padding: theme.spacing(1),
        borderRadius: 1,
        },
        label: {
            color: '#8c8c8c',
            margin: 0,
        }
    }),
);

export interface MetricProps {
    values: [{
        value: string,
        label: string
    }]
};

const initialState = {
    measurements: []
};

const colors = ['#8884d8', '#cc00ff', '#ff3399', '#ffff00', '#ff6600', '#993336'];

export default (props: MetricProps) => {
    return (
        <Provider value={client}>
            <Chart values={props.values} />
        </Provider>
    );
};

const Chart = (props: MetricProps) => {
    const classes = useStyles();
    const timeInterval= new Date().getTime() - (60 * 30 * 1000);
    const metrics = props.values.map(metric => ({
        metricName: metric.value,
        after: timeInterval
    }));
    const [state, dispatch] = useReducer(reducer, initialState);

    const [{ data, error }] = useQuery({
        query: MESUREMENTS_QUERY,
        variables: {
            input: metrics
        }
    });
    useEffect(() => {
        if(error) {
            dispatch({
                type: 'error',
                payload: error.message,
            });
            return;
        }
        if (!data) return;
        const { getMultipleMeasurements } = data;
        dispatch({
            type: 'measurements',
            payload: getMultipleMeasurements
        });
    }, [dispatch, data, error]);

    const formatXAxis = (tickItem: any) => {  //not working correctly
        const xAxis = tickItem % 3600000 <= 1000 ? moment(new Date(tickItem)).format('h A') :
            moment(new Date(tickItem)).format('h:mm');
        return xAxis;
    };

    const customTooltip = ({ active, payload, label }: any) => {
        if(active && payload && payload.length) {
            return (
                <div className={classes.customTooltip}>
                    <p className={classes.label}>{moment(label).format('MMM D YYYY LTS')}</p>
                    { payload.map((data: any )=> (
                        <p key={data.stroke} className={classes.label}><b>{data.payload.metric}</b>: {data.value}</p>
                    )) }
                </div>
            )
        };
        return null;
    };

    return (
        <div style={{ width: '90%', height: 550, margin: 'auto' }}>
            <ResponsiveContainer>                
                <LineChart
                    width={500}
                    height={300}
                    margin={{
                        top: 30,
                        right: 30,
                        left: 5,
                        bottom: 5,
                    }}
                >
                    <XAxis 
                        dataKey='at' 
                        tickFormatter={formatXAxis} 
                        type='number' 
                        domain={['dataMin', 'dataMax']} 
                        tickCount={10} 
                    />
                    <YAxis 
                        type="number" 
                        domain={['auto', 'auto']} 
                        label={{ value: 'F', angle: -90, position: 'insideTopLeft' }} 
                        tickCount={10} 
                    />
                    <Tooltip content={customTooltip} cursor={{stroke: 'black', strokeWidth: .3}} />
                    { 
                        state.measurements.length && state.measurements.map((metric: any, idx: number) => (
                            <Line 
                                key={idx} data={metric.measurements} 
                                dataKey='value' 
                                stroke={colors[idx]} 
                                dot={false} 
                                activeDot={false} 
                            />
                        )) 
                    }
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
