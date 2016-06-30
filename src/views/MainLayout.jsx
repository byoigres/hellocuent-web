'use strict';

const React = require('react');
const Component = React.Component;
const PropTypes = React.PropTypes;

class MainLayout extends Component {
    render() {

        const assets = this.props.assets;
        const initialState = {
            entities: {
                users: {}
            },
            authentication: null
        };

        if (this.props.session) {
            initialState.entities.users[this.props.session.id] = this.props.session;
            initialState.authentication = {};
            initialState.authentication.id = this.props.session.id;
        }

        return (
            <html>
                <head>
                    <title>{this.props.title}</title>
                    <meta charSet="utf-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximun-scale=1.0, user-scalable=no" />
                    <link rel="stylesheet" href={assets.vendor.css} />
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `window.__shared = ${JSON.stringify(initialState)};`
                        }}
                    >
                    </script>
                </head>
                <body>
                    {this.props.children}
                    <script src={assets.vendor.js}></script>
                    {this.props.feet}
                </body>
            </html>
        );
    }
}

MainLayout.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    feet: PropTypes.object.isRequired,
    assets: PropTypes.object.isRequired,
    session: PropTypes.object
};

module.exports = MainLayout;
