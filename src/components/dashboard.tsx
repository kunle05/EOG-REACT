import React, { useEffect, useReducer } from 'react';
import { Provider, createClient, useQuery } from 'urql';
import LinearProgress from '@material-ui/core/LinearProgress';
import FormControl from '@material-ui/core/FormControl';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import NativeSelect from '@material-ui/core/NativeSelect';

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
    formControl: {
      margin: theme.spacing(1),
      minWidth: 200,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }),
);

const initialState = {
    metrics: [],
    value: '',
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
    const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => dispatch({
        type: 'value',
        payload: e.target.value,
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
        const { getMetrics } = data;
        dispatch({
            type: 'metrics',
            payload: getMetrics
        })
    }, [dispatch, data, error])

    if (fetching) return <LinearProgress />;

    return (
        <div>
            <FormControl className={classes.formControl}>
                <NativeSelect
                    className={classes.selectEmpty}
                    value = {state.value}
                    name='metric'
                    onChange = {handleChange}
                    inputProps={{'aria-label': 'metric'}}
                >
                    <option value='' disabled>Select metric..</option>
                    { state.metrics.map(metric) }
                </NativeSelect>
            </FormControl>
        </div>
    );
};

const metric = (metric: string) => (
    <option key={metric} value={metric}>{ metric }</option>
)
