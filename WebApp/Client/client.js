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
            return <p>{page.content}</p>
        });
        return <div className="page_list">{pages}</div>
    }
}
