/* PokéSAG browser implementation */
class PokeSAG_Client extends React.Component
{

    constructor ()
    {
        super ();

        this.state = {
            mode: "normal",
            pages_database: [],
            search_string: "",
            
            hamburger_class: "hamburger_button",
            settings_class: "settings hidden",

            full_text_search: false,
            auto_refresh: false,
            auto_refresh_timer: null,
        };
    }

    update_search_string = (e) =>
    {
        this.setState ( { search_string: e.target.value } );

        if (e.target.value == '')
        {
            this.state.mode = 'normal';
            this.refresh_data ();
        }
    }

    handle_search = (e) =>
    {
        if (e.key === 'Enter' && this.state.search_string != '')
        {
            this.state.mode = 'search';
            this.refresh_data ();
        }
    }

    refresh_data = () =>
    {
        switch (this.state.mode)
        {
            case 'search':
                let search_type = this.state.full_text_search ? 'ft' : 'basic';
                fetch ('/Pages/Search/' + this.state.search_type + '/' + encodeURIComponent(this.state.search_string) + '/')
                    .then ( result => {
                        result.json()
                            .then ( json => {
                                this.setState ( { pages_database: json } );
                            });
                    });
                break;

            case 'normal':
            default:
                fetch ('/Pages/')
                    .then ( result => {
                        result.json()
                            .then ( json => {
                                this.setState ( { pages_database: json } );
                            });
                    });
        }
    }

    /* Toggle whether the settings are visible or not */
    toggle_settings = () =>
    {
        if (this.state.settings_class == "settings hidden")
        {
            this.setState({settings_class: "settings visible"});
            this.setState({hamburger_class: "hamburger_button green"});
        }
        else
        {
            this.setState({settings_class: "settings hidden"});
            this.setState({hamburger_class: "hamburger_button"});
        }
    }

    handle_search_toggle = (is_active) =>
    {
        this.setState({full_text_search: is_active})
    }

    handle_refresh_toggle = (is_active) =>
    {
        if (is_active)
        {
            this.setState({
                auto_refresh_timer: setInterval(() => this.refresh_data(null), 10000),
                auto_refresh: true
            });
        } 
        else 
        {
            clearInterval(this.state.auto_refresh_timer);
            this.setState({
                auto_refresh_timer: null,
                auto_refresh: false
            });
        }
    }

    componentDidMount ()
    {
        this.refresh_data (null);
    }

    render ()
    {
        /* Get the list of messages */
        let pages = this.state.pages_database.map ( page => {
            return <tr>
                    <td className="page_rx_date">{page.rx_date}</td>
                    <td className="page_source">{page.source}</td>
                    <td className="page_recipient">{page.recipient}</td>
                    <td className="page_content">{page.content}</td>
                </tr>
        });

        /* Generate page */
        return <div className="app_container">

                <div className="toolbar">
                    <input className={this.state.hamburger_class} type="button" value="☰" onClick={this.toggle_settings} />
                    <input className="search_box" type="text" placeholder="Search…" value={this.state.search_string} onChange={this.update_search_string} onKeyPress={this.handle_search} />
                    <input className="refresh_button" type="button" value="↻" onClick={this.refresh_data} />
                </div>

                <div className={this.state.settings_class}>
                    <h4> Settings </h4>
                    <SettingButton value="Auto Refresh" default_state={false} action={this.handle_refresh_toggle} />
                    <SettingButton value="Full Text Search" default_state={true} action={this.handle_search_toggle} />
                </div>

                <div className="page_table">
                    <table>
                        <thead>
                            <th scope="col">Received</th>
                            <th scope="col">Source</th>
                            <th scope="col">Recipient</th>
                            <th scope="col">Message</th>
                        </thead>
                        <tbody>
                            {pages}
                        </tbody>
                    </table>
                </div>
            </div>
    }
}

class SettingButton extends React.Component {
    constructor(props) {
        super(props);
        let stored_state = localStorage.getItem(props.value);
        this.state = {
            is_active: stored_state ? JSON.parse(stored_state) : props.default_state
        };
        this.props.action(this.state.is_active);
    }

    handle_click = () => {
        /* we use a callback here, since setState is asynchronous */
        this.setState({is_active: !this.state.is_active}, () => {
            this.props.action(this.state.is_active);   
            localStorage.setItem(this.props.value, this.state.is_active);
        });
    }

    render() {
        return (
            <input className={this.state.is_active ? 'setting green' : 'setting red'}
            type="button" value={this.props.value} onClick={this.handle_click}  />
        )
    }
}
