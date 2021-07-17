import React, { useEffect, useReducer } from 'react';
import { Provider, useQuery } from 'urql';
import Select from 'react-select';
import LinearProgress from '@material-ui/core/LinearProgress';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { client } from '../Features/Weather/Weather';
import Chart from './chart';

const METRICS_QUERY = `
    query {
        getMetrics
    }
`;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dropDown: {
      margin: theme.spacing(2),
      maxWidth: 500,
    },
  }),
);

const initialState = {
    metrics: [],
    values: [],
};
 
export function reducer(state: any, action: any) {
    return {
        ...state,
        [action.type]: action.payload
    };
}

export default () => {
    return (
      <Provider value={client}>
        <Dashboard />
      </Provider>
    );
};

const Dashboard = () => {
    const classes = useStyles();
    const [state, dispatch] = useReducer(reducer, initialState);
    const handleChange = (e: any) => dispatch({
        type: 'values',
        payload: e,
    })

    const [{ fetching, data, error }] = useQuery({ query: METRICS_QUERY });
    useEffect(() => {
        if(error) {
            dispatch({
                type: 'error',
                payload: error.message,
            })
            return;
        }
        if (!data) return;
        const options = data.getMetrics.map((metric: string) => ({
            'value': metric,
            'label': metric
        }));

        dispatch({
            type: 'metrics',
            payload: options
        })
    }, [dispatch, data, error])

    if (fetching) return <LinearProgress />;

    return (
        <div>
            <div style={{ width: '75%', margin: 'auto' }}>
                <Select
                    isMulti
                    placeholder='Select metric...'
                    options={state.metrics}
                    onChange={handleChange}
                    className={classes.dropDown}
                />
            </div>
            { state.values.length > 0 && <Chart values={state.values} /> }
        </div>
    );
};