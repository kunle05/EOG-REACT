import React, { useEffect, useReducer } from 'react';
import { Provider, useQuery } from 'urql';
import Select from 'react-select';
import LinearProgress from '@material-ui/core/LinearProgress';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import { client } from '../Features/Weather/Weather';
import Chart from './chart';
import Measurement from './measurement';

const METRICS_QUERY = `
    query METRICS_QUERY {
        getMetrics
    }
`;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            padding: 30,
        },
        root: {
            flexGrow: 1,
        },
        dropDown: {
        maxWidth: 500,
        },
    })
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
};

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
    });

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
        });
    }, [dispatch, data, error]);

    if (fetching) return <LinearProgress />;

    return (
        <Container className={classes.container}>
            <div className={classes.root}>
                <Grid container spacing={3}>
                    <Grid item xs={8}>
                        <Measurement values={state.values} />
                    </Grid>
                    <Grid item xs={4}>
                        <Select
                            isMulti
                            placeholder='Select metric...'
                            options={state.metrics}
                            onChange={handleChange}
                            className={classes.dropDown}
                        />
                    </Grid>
                </Grid>
            </div>
            { state.values.length > 0 && <Chart values={state.values} /> }
        </Container>
    );
};