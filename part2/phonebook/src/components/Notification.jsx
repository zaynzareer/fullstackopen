const Notification = ({ message, type }) => {
    if (message === null) {
        return null
    }

    const SuccessNotificationStyle ={
        backgroundColor: '#EFE',
        border: '1px solid #DED',
        color: '#9A9',
    }

    const ErrorNotificationStyle = {
        backgroundColor: '#FEE',
        border: '1px solid #EDD',
        color: '#A66'
    }

    const alertTestStyle = {
        display: 'table',
        margin: '0 auto',
        textAlign: 'center',
        fontSize: '16px',
    }

    const notificationStyle = type === 'success' ? SuccessNotificationStyle : ErrorNotificationStyle

    return (
        <div style={notificationStyle} >
            <span style={alertTestStyle}> {message} </span>
        </div>
    )
}

export default Notification