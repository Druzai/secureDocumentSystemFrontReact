import React, {Component} from 'react';

interface DynamicSelectProps {
    name: string | null;
    value: any;
    arrayOfData: Array<any> | null | undefined;
    onSelectChange: any;
}

class DynamicSelect extends Component<DynamicSelectProps> {
    // On the change event for the select box pass the selected value back to the parent
    handleChange = (event: any) => {
        let selectedValue = event.target.value;
        this.props.onSelectChange(selectedValue);
    }

    render() {
        let arrayOfData = this.props.arrayOfData;
        let options = arrayOfData != null
            ? arrayOfData.map((data: any) =>
                data.id < 0
                    ? <></>
                    :
                    <option
                        key={data.id}
                        value={data.id}
                    >
                        {data.name}
                    </option>
            )
            : <></>

        return (
            <select name={this.props.name || "dynamicSelect"} value={this.props.value} className="custom-search-select"
                    onChange={this.handleChange}>
                {/*<option value={-1}>Выберите элемент</option>*/}
                {options}
            </select>
        )
    }
}

export default DynamicSelect;