/* PokéSAG browser implementation */
class PokeSAG_Client extends React.Component
{

    constructor ()
    {
        super ();

        this.state = {
            pages_database: [],
            search_string: "",
            auto_refresh: false,
            auto_refresh_timer: null,
            hamburger_class: "hamburger_button",
            settings_class: "settings hidden",
            auto_refresh_class: "setting red"
        };

        this.refresh_data = this.refresh_data.bind (this);
        this.update_search_string = this.update_search_string.bind (this);
        this.perform_search = this.perform_search.bind (this);
        this.toggle_settings = this.toggle_settings.bind (this);
        this.toggle_auto_refresh = this.toggle_auto_refresh.bind (this);
    }


    update_search_string (e)
    {
        /* Remove characters that don't “just work” */
        let filtered_string = e.target.value.replace (/[#%.?\/\\]/g, '');
        this.setState ( { search_string: filtered_string } );
    }

    perform_search (e)
    {
        if (e.key === 'Enter' && this.state.search_string != '')
        {
            fetch ('/Pages/Search/' + this.state.search_string + '/')
                .then ( result => {
                    result.json()
                        .then ( json => {
                            this.setState ( { pages_database: json } );
                        });
                });
        }
    }

    refresh_data (e)
    {
        fetch ('/Pages/')
            .then ( result => {
                result.json()
                    .then ( json => {
                        this.setState ( { pages_database: json } );
                    });
            });
    }

    componentDidMount ()
    {
        this.refresh_data (null);
    }

    /* Toggle whether the settings are visible or not */
    toggle_settings ()
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

    toggle_auto_refresh ()
    {
        if (this.state.auto_refresh == false)
        {
            this.state.auto_refresh = true;
            this.state.auto_refresh_timer = setInterval( () => this.refresh_data(null), 15000);
            this.setState({auto_refresh_class: "setting green"});
        }
        else
        {
            this.state.auto_refresh = false;
            clearInterval(this.state.auto_refresh_timer);
            this.state.auto_refresh_timer = null;
            this.setState({auto_refresh_class: "setting red"});
        }
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
                    <input className="search_box" type="text" placeholder="Search…" value={this.state.search_string} onChange={this.update_search_string} onKeyPress={this.perform_search} />
                    <input className="refresh_button" type="button" value="↻" onClick={this.refresh_data} />
                </div>

                <div className={this.state.settings_class}>
                    <h3> Settings </h3>
                    <input className={this.state.auto_refresh_class} type="button" value="Auto Refresh" onClick={this.toggle_auto_refresh}  />
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
