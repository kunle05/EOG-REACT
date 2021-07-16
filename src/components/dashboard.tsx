import React, { useEffect, useReducer } from 'react';
import { Provider, createClient, useQuery } from 'urql';
import Select from 'react-select';
import LinearProgress from '@material-ui/core/LinearProgress';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const client = createClient({
    url: 'https://react.eogresources.com/graphql',
});

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
 
function reducer(state: any, action: any) {
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
            <Select
                isMulti
                placeholder='Select metric...'
                options={state.metrics}
                onChange={handleChange}
                className={classes.dropDown}
            />
        </div>
    );
};