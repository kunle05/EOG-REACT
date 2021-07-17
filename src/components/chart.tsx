import React, { useEffect, useReducer } from 'react';
import { Provider, useQuery } from 'urql';
import moment from 'moment';
import LinearProgress from '@material-ui/core/LinearProgress';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { client } from '../Features/Weather/Weather';
import { reducer } from './dashboard';

const MESUREMENTS_QUERY = `
    query($input: [MeasurementQuery]) {
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

interface MetricProps {
    values: [{
        value: string,
        label: string
    }]
}

const initialState = {
    measurements: []
}

export default (props: MetricProps) => {
    return (
      <Provider value={client}>
        <Chart values={props.values} />
      </Provider>
    );
};

const Chart = (props: MetricProps) => {
    const classes = useStyles();
    const timeframe = new Date().getTime() - (60 * 30);
    const metrics = props.values.map(metric => ({
        metricName: metric.value,
        // after: timeframe
    }));
    const [state, dispatch] = useReducer(reducer, initialState);

    const [{ fetching, data, error }] = useQuery({
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
            })
            return;
        }
        if (!data) return;
        const { getMultipleMeasurements } = data;
        const measurement = getMultipleMeasurements[0].measurements;

        dispatch({
            type: 'measurements',
            payload: measurement
        });
    }, [dispatch, data, error]);

    if (fetching) return <LinearProgress />;

    const formatXAxis = (tickItem: any) => {
        const xAxis = tickItem%3600 === 0 ? moment(tickItem).format('h A') :
            moment(tickItem).format('h:mm');
        return xAxis;
    };

    const customTooltip = ({ active, payload, label }: any) => {
        if(active && payload && payload.length) {
            return (
                <div className={classes.customTooltip}>
                    <p className={classes.label}>{moment(label).format('MMM D YYYY LTS')}</p>
                    <p className={classes.label}><b>{payload[0].payload.metric}</b>: {payload[0].value}</p>
                </div>
            )
        }
        return null;
    }

    return (
        <div style={{ width: '80%', height: 600, margin: 'auto' }}>
            <ResponsiveContainer>                
                <LineChart
                    width={500}
                    height={300}
                    data={state.measurements} 
                    margin={{
                        top: 30,
                        right: 30,
                        left: 5,
                        bottom: 5,
                    }}
                >
                    <XAxis dataKey='at' tickFormatter={formatXAxis} />
                    <YAxis />
                    <Tooltip content={customTooltip} cursor={{stroke: 'black'}} />
                    <Line dataKey="value" stroke="#8884d8" dot={false} activeDot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
