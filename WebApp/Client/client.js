/* PokéSAG browser implementation */
class PokeSAG_Client extends React.Component
{

    constructor ()
    {
        super ();

        this.state = {
            pages_database: [],
            search_string: ""
        };

        this.refresh_data = this.refresh_data.bind (this);
        this.update_search_string = this.update_search_string.bind (this);
        this.perform_search = this.perform_search.bind (this);
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

    render ()
    {
        let pages = this.state.pages_database.map ( page => {
            return <tr>
                    <td className="page_rx_date">{page.rx_date}</td>
                    <td className="page_source">{page.source}</td>
                    <td className="page_recipient">{page.recipient}</td>
                    <td className="page_content">{page.content}</td>
                </tr>
        });
        return <div className="app_container">
                <div className="toolbar">
                    <input className="hamburger_button" type="button" value="☰" />
                    <input className="search_box" type="text" placeholder="Search…" value={this.state.search_string} onChange={this.update_search_string} onKeyPress={this.perform_search} />
                    <input className="refresh_button" type="button" value="↻" onClick={this.refresh_data} />
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
