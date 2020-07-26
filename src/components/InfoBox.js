import React from 'react'

import { Card, CardContent, Typography } from '@material-ui/core'

import "./style/InfoBox.css"
import { prettyPrintStat } from '../util'

function InfoBox({ title, cases, total, active, isRed, ...props }) {
    return (
        <Card
            onClick={props.onClick}
            className={`infoBox ${active && "infoBox--selected"} ${isRed && "infoBox--selected-red"}`}>
            <CardContent>
                <Typography
                    className="infoBox__title"
                    color="textSecondary">{title}</Typography>
                <h2 className={`infoBox__cases ${!isRed && "infoBox-font-green"}`}>{prettyPrintStat(cases)} Today</h2>
                <Typography
                    className="infoBox__total"
                    color="textSecondary">{prettyPrintStat(total)} Total</Typography>
            </CardContent>
        </Card>
    )
}

export default InfoBox
