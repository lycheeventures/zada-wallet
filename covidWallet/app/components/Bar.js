import React from 'react'
import { StatusBar } from 'react-native'

const Bar = ({ backgroundColor, type }) => {
    return (
        <StatusBar
            backgroundColor={backgroundColor}
            barStyle={type == undefined || type == 'light' ? 'light-content' : 'dark-content'}
        />
    )
}

export default Bar;