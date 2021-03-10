import React from 'react';
import { DateTime } from 'luxon';

export default class Client extends React.Component
{
    constructor ()
    {
        super ();

        this.state = {
            mode: "normal",
            pages_database: [],
            search_string: "",
            page: 1,
            
            hamburger_class: "hamburger_button",
            settings_class: "hidden",

            date_format: "yyyy-LL-dd TT",

            full_text_search: false,
            auto_refresh: false,
            auto_refresh_timer: null,
        };
    }

    update_search_string = (e) =>
    {
        this.setState ({ search_string: e.target.value });

        if (e.target.value == '')
        {
            this.state.mode = 'normal';
            this.refresh_clean ();
        }
    }

    handle_search = (e) =>
    {
        if (e.key === 'Enter' && this.state.search_string != '')
        {
            this.state.mode = 'search';
            this.refresh_clean ();
        }
    }

    refresh = () =>
    {
        const page = this.state.page;
        switch (this.state.mode)
        {
            case 'search':
                const type = this.state.full_text_search ? 'ft' : 'basic';
                const query = encodeURIComponent (this.state.search_string);
                var url = `/pages/search/${type}/${query}/${page}/`;
                break;

            case 'normal':
            default:
                var url = `/pages/${page}/`;
        }

        fetch (url)
            .then (result => result.json ())
            .then (json => {
                if (!json.success) {
                    throw Error (json.error);
                }
                this.setState ({pages_database: json.data});
            })
            .catch (error => {
                console.error ('Unable to fetch pages:', error);    
            });
    }

    refresh_clean = () =>
    {
        this.setState ({page: 1}, () => {
            this.refresh ();
        });
    }

    /* Toggle whether the settings are visible or not */
    toggle_settings = () =>
    {
        if (this.state.settings_class == "hidden")
        {
            this.setState ({ settings_class: "visible" });
            this.setState ({ hamburger_class: "hamburger_button green" });
        }
        else
        {
            this.setState ({ settings_class: "hidden" });
            this.setState ({ hamburger_class: "hamburger_button" });
        }
    }

    handle_search_toggle = (is_active) =>
    {
        this.setState ({ full_text_search: is_active });
    }

    handle_refresh_toggle = (is_active) =>
    {
        if (is_active)
        {
            this.setState ({
                auto_refresh_timer: setInterval (() => this.refresh_data (null), 10000),
                auto_refresh: true
            });
        } 
        else 
        {
            clearInterval (this.state.auto_refresh_timer);
            this.setState ({
                auto_refresh_timer: null,
                auto_refresh: false
            });
        }
    }

    handle_24h_toggle = (is_active) =>
    {
        if (is_active)
        {
            this.setState ({date_format: 'yyyy-LL-dd TT'});
        } 
        else 
        {
            this.setState ({date_format: 'yyyy-LL-dd tt'});
        }
    }

    handle_recipient_click = (r) => {
        this.setState({mode: "search", search_string: r}, () => {
            this.refresh_clean ();
        });
    }
    
    handle_page_change = (page) =>
    {
        this.setState ({page: page}, () => {
            this.refresh ();
        });
    }

    componentDidMount ()
    {
        this.refresh ();
    }

    render ()
    {
        /* Get the list of messages */
        let pages = this.state.pages_database.map ( page => {
            const formatted_date = DateTime.fromISO(page.rx_date).toFormat(this.state.date_format);
            return <tr>
                    <td className="page_rx_date">{formatted_date}</td>
                    <td className="page_source">{page.source}</td>
                    <td className="page_recipient" onClick={() => this.handle_recipient_click (page.recipient)}>{page.recipient}</td>
                    <td className="page_content">{page.content}</td>
                </tr>
        });

        /* Generate page */
        return (
            <main>
                <nav id="toolbar">
                    <button className={this.state.hamburger_class} onClick={this.toggle_settings} title="Settings">
                        <i className="bi-list"></i>
                    </button>
                    <input className="search_box" type="text" placeholder="Search…" value={this.state.search_string}
                           onChange={this.update_search_string} onKeyPress={this.handle_search} aria-label="Search Box" />
                    <div className="spacer"></div>
                    <Transporter on_change={this.handle_page_change} page={this.state.page}/>
                </nav>

                <div id="settings" className={this.state.settings_class}>
                    <h4> Settings </h4>
                    <SettingButton value="Auto Refresh" default_state={false} action={this.handle_refresh_toggle} />
                    <SettingButton value="Full Text Search" default_state={true} action={this.handle_search_toggle} />
                    <SettingButton value="24 Hour Time" default_state={true} action={this.handle_24h_toggle} />
                </div>

                <div id="page_table">
                    <table>
                        <thead>
                            <tr>
                                <th scope="col">Received</th>
                                <th scope="col">Source</th>
                                <th scope="col">Recipient</th>
                                <th scope="col">Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages}
                        </tbody>
                    </table>
                </div>
            </main>
        )
    }
}

class SettingButton extends React.Component {
    constructor (props) {
        super (props);
        let stored_state = localStorage.getItem (props.value);
        this.state = {
            is_active: stored_state ? JSON.parse (stored_state) : props.default_state
        };
        this.props.action (this.state.is_active);
    }

    handle_click = () => {
        /* we use a callback here, since setState is asynchronous */
        this.setState ({ is_active: !this.state.is_active }, () => {
            this.props.action (this.state.is_active);
            localStorage.setItem (this.props.value, this.state.is_active);
        });
    }

    render () {
        return (
            <input className={this.state.is_active ? 'setting green' : 'setting red'}
                   type="button" value={this.props.value} onClick={this.handle_click}  />
        )
    }
}

class Transporter extends React.Component {
    constructor (props) {
        super (props);
    }

    clear = () => {
        const page = 1;
        this.props.on_change (page);
    }

    previous = () => {
        const page = (this.props.page - 1) > 0 ? (this.props.page - 1) : 1;
        this.props.on_change (page);
    }

    next = () => {
        const page = this.props.page + 1;
        this.props.on_change (page);
    }

    render () {
        return (
            <nav id="transporter">
                {this.props.page > 1 &&
                    <button onClick={this.previous} title="Previous Page">
                        <i className="bi-chevron-left"></i>
                    </button>
                }
                {this.props.page > 1 &&
                    <button id="page_num" onClick={this.clear}>
                        {this.props.page}
                    </button>
                }
                <button onClick={this.next} title="Next Page">
                    <i className="bi-chevron-right"></i>
                </button>
                <button onClick={this.clear} title="Refresh">
                {this.props.page > 1
                    ? <i className="bi-arrow-90deg-up"></i>
                    : <i className="bi-arrow-clockwise"></i>
                }
                </button>
            </nav>
        )
    }
}
