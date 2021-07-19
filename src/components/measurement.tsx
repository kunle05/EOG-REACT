import React from 'react';
import { Provider, createClient, useSubscription, defaultExchanges, subscriptionExchange } from 'urql';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { MetricProps } from './chart';

const subscriptionClient = new SubscriptionClient('ws://react.eogresources.com/graphql', { reconnect: true });

const client = createClient({
    url: 'https://react.eogresources.com/graphql',
  exchanges: [
    ...defaultExchanges,
    subscriptionExchange({
      forwardSubscription(operation) {
        return subscriptionClient.request(operation);
      },
    }),
  ],
});

const NEW_MEASUREMENT = `
    subscription NEW_MEASUREMENT {
        newMeasurement {
            metric
            value
        }
    }
`;

const useStyles = makeStyles({
    root: {
      minWidth: 255,
      marginRight: 20,
      marginBottom: 20,
    },
    content: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
});
  

const handleSubscription = (metrics:any = [], response: any) => {
    let found = false;
    let newMetrics = [];

    if(metrics.length) {
        newMetrics = metrics.map((item: any) => {
            if(item.metric === response.newMeasurement.metric) {
                item.value = response.newMeasurement.value;
                found = true;
            }   
            return item;
        })
    } 
    if(!found) {
        newMetrics.push(response.newMeasurement);
    }
    return newMetrics;
};

export default (props: MetricProps) => {
    return (
      <Provider value={client}>
        <Measurement values={props.values} />
      </Provider>
    );
};

const Measurement = (props: MetricProps) => {
    const metricsToShow = props.values.map((metric: any) => metric.value);
    const [res] = useSubscription({ query: NEW_MEASUREMENT }, handleSubscription as any);

    if(!res.data) return <div></div>

    return (
        <Grid container spacing={3}>
            { res.data.map((item: any, idx: number) => {
                if(metricsToShow.includes(item.metric )) {
                    return <MetricDisplay key={idx} data={item} />
                }
                return null;
            }) }
        </Grid>
    );
};

const MetricDisplay = ({data: {metric, value}}: any) => {
    const classes = useStyles();
    return (
        <Card className={classes.root} >
            <CardContent>
                <Typography variant="h6">
                    {metric}
                </Typography>
                <Typography className={classes.content} variant="h3" component="h3">
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
};