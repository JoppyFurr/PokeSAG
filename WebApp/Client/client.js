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

            search_type: "ft",
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

    toggle_search_type = () =>
    {
        if (this.state.search_type == 'ft')
        {
            this.setState({search_type: 'basic'})
            localStorage.setItem('search_type', 'basic');
        }
        else
        {
            this.setState({search_type: 'ft'})
            localStorage.setItem('search_type', 'ft');
        }
    }

    toggle_auto_refresh = () =>
    {
        if (this.state.auto_refresh == false)
        {
            this.setState({
                auto_refresh_timer: setInterval( () => this.refresh_data(null), 15000),
                auto_refresh: true
            });
            localStorage.setItem('auto_refresh', 'true');
        }
        else
        {
            clearInterval(this.state.auto_refresh_timer);
            this.setState({
                auto_refresh_timer: null,
                auto_refresh: false
            });
            localStorage.setItem('auto_refresh', 'false');
        }
    }

    componentDidMount ()
    {
        let search_type =  localStorage.getItem('search_type') ||  'ft';
        let auto_refresh = localStorage.getItem('auto_refresh') === 'true' ||  false;
        this.setState({ 
            search_type: search_type, 
            auto_refresh: auto_refresh
        });
        
        if (auto_refresh) {
            this.setState({
                auto_refresh_timer: setInterval( () => this.refresh_data(null), 15000),
            });
        }
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
                    <input className={this.state.auto_refresh ? 'setting green' : 'setting red'}
                           type="button" value="Auto Refresh" onClick={this.toggle_auto_refresh}  />
                    <input className={this.state.search_type == 'ft' ? 'setting green' : 'setting red'}
                           type="button" value="Full Text Search" onClick={this.toggle_search_type}  />
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
