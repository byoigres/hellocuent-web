'use strict';

const React = require('react');
const MainLayout = require('./MainLayout');
const Component = React.Component;
const PropTypes = React.PropTypes;

class HomeView extends Component {
    render() {

        const feet = (<script src={this.props.assets.app.js}></script>);

        return (
            <MainLayout
                title={this.props.title}
                assets={this.props.assets}
                feet={feet}
                session={this.props.session}
            >
                <div id="app-mount">
                    Home entry points
                </div>
            </MainLayout>
        );
    }
}

HomeView.propTypes = {
    title: PropTypes.string.isRequired,
    assets: PropTypes.object.isRequired,
    session: PropTypes.object
};

module.exports = HomeView;
