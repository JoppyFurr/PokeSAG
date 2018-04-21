/* PokéSAG browser implementation */
class PokeSAG_Client extends React.Component
{

    constructor ()
    {
        super ();

        this.state = {
            pages_database: []
        };

        this.refresh_data = this.refresh_data.bind (this);
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
                    <input className="search_box" type="text" placeholder="Search…" />
                    <input className="refresh_button" type="button" value="↻" />
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
