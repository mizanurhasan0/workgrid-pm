 
import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  Bugs, Flag,
  IssueOthers,
} from '../assets';
import SVGIcon from './SVGIcon';
import req from '../Utils/req';
import AlertToster from './AlertToster';

const icons = {
  'Bugs': Bugs,
  'IssueOthers': IssueOthers,
  'Flag': Flag,
};
/**
 * Custom-field dropdown cell for a task (status/priority/issue type). Clicking the label cycles to the next option, the arrow opens the list.
 * @param {Object} props
 * @param {Object} props.field Custom field definition with value[] options.
 * @param {Object} props.selected The task's stored value for this field.
 * @param {Object} props.forTask The task being edited.
 */
export default function DropDown({ field, selected, forTask }) {
  const options = field?.value ?? [];
  const [selectedOption, setSelectedOption] = useState(options.find((option) => (
    option.value === selected?.value)) || options[0]);
  const bodyRef = useRef();
  const buttonRef = useRef();

  function handleButtonClick() {
    if ((bodyRef?.current?.style?.display === 'block')) {
      bodyRef.current.style.display = 'none';
    } else {
      bodyRef.current.style.display = 'block';
    }
  }

  function handelOutsideClick(e) {
    if (bodyRef.current
      && !bodyRef?.current?.contains(e.target)
      && !buttonRef?.current?.contains(e.target)) {
      bodyRef.current.style.display = 'none';
    }
  }

  function handleOptionClick(option) {
    bodyRef.current.style.display = 'none';
    const cFields = forTask.customFields.map((each) => {
      const data = { ...each };
      if (each.cf === field.id) {
        data.value = option.value;
        return data;
      }
      return data;
    });
    req({ method: 'PATCH', uri: `task/${forTask.id}`, data: { customFields: cFields } })
      .then(() => {
        setSelectedOption(option);
      })
      .catch(() => AlertToster('Could not update the field.', 'error'));
  }

  function nextStatus() {
    if (options.length === 0) {return;}
    const index = options.findIndex((item) => item.value === selectedOption?.value);
    const fieldValue = options.length === index + 1 ? { ...options[0] } : { ...options[index + 1] };
    const cFields = forTask.customFields.map((each) => {
      const data = { ...each };
      if (each.cf === field.id) {
        data.value = fieldValue.value;
        return data;
      }
      return data;
    });
    req({ method: 'PATCH', uri: `task/${forTask.id}`, data: { customFields: cFields } })
      .then(() => {
        setSelectedOption(fieldValue);
      })
      .catch(() => AlertToster('Could not update the field.', 'error'));
  }

  const getOptionStyle = () => {
    const { background = 'transparent', color = '#E5493A' } = selectedOption;
    return {
      backgroundColor: background,
      fill: color,
    };
  };
  useEffect(() => {
    document.addEventListener('click', handelOutsideClick);
    return () => {
      document.removeEventListener('click', handelOutsideClick);
    };
  }, []);
  return (
    <div className="relative">
      <div className="flex justify-start items-center">
        {
          field?.onlyIcon ? (
            <div style={getOptionStyle()} className="flex justify-center items-center  px-2 py-[0.275rem] rounded-md">
              <div
                className="flex items-center"
              >
                {
                  selectedOption?.icon ? (
                    <button
                      type="button"
                      aria-label="Change issue type"
                      onClick={(e) => handleButtonClick(e)}
                      ref={buttonRef}
                      className=""
                    >
                      <p className="w-6 h-6  rounded-md flex justify-center items-center">
                        <SVGIcon Icon={icons[selectedOption?.icon]} className={`${selectedOption?.class} w-full h-full rounded-md p-1`} />
                      </p>
                    </button>
                  ) : <div style={{ backgroundColor: `${selectedOption?.color}` }} className="h-[0.375rem] w-[0.375rem] rounded-full mr-[0.125rem]" />
                }
              </div>
            </div>
          ) : (
            <div style={getOptionStyle()} className="flex justify-center items-center  px-2 py-[0.275rem] rounded-md">
              <div
                onClick={(e) => nextStatus(e)}
                onKeyDown={() => { }}
                role="contentinfo"
                className="flex items-center"
              >
                {
                  selectedOption?.icon ? (
                    <button
                      type="button"
                      aria-label="Change issue type"
                      ref={buttonRef}
                      onClick={(e) => handleButtonClick(e)}
                    >
                      <p className="w-6 h-6  rounded-md flex justify-center items-center">
                        <SVGIcon Icon={icons[selectedOption?.icon]} className={`${selectedOption?.class} w-full h-full rounded-md p-1`} />
                      </p>
                    </button>
                  ) : <div style={{ backgroundColor: `${selectedOption?.color}` }} className="h-[0.375rem] w-[0.375rem] rounded-full mr-[0.125rem]" />
                }
                <div className="flex justify-evenly items-center">
                  <button type="button" className={`whitespace-nowrap text-xs font-medium leading-3 uppercase ml-[0.125rem] ${selectedOption?.background ? 'text-slate-700' : 'text-text'}`}>
                    {selectedOption?.value}
                  </button>
                </div>
              </div>
              <div
                onClick={(e) => handleButtonClick(e)}
                onKeyDown={() => { }}
                role="contentinfo"
                ref={buttonRef}
                className=""
              >
                <SVGIcon Icon={ArrowDown} className="w-[1rem]" />
              </div>
            </div>
          )
        }
      </div>

      <div ref={bodyRef} className="absolute hidden bg-surface-raised text-text border border-border w-[11.19rem] max-w-[calc(100vw-2rem)] max-h-72 overflow-y-auto z-dropdown shadow-pop px-3 rounded-card">
        <div>
          <input className="text-xs py-2 w-full bg-transparent outline-0 leading-6 font-medium text-text-muted placeholder:text-text-muted" type="text" name="search" placeholder="Issue type to search or add..." aria-label="Search issue types" />
          <p className="text-xs py-2 leading-6 font-medium text-text-muted">Select Issue types</p>
        </div>
        {options.map((option) => (
          <button
            type="button"
            key={option?.value}
            className="flex justify-start items-center rounded-md my-1 py-1 text-xs w-full px-3 min-h-8 leading-6 font-medium text-subInfo"
            onClick={() => handleOptionClick(option)}
            style={{ backgroundColor: `${option?.background}` }}
          >
            {
              option?.icon
                ? <SVGIcon Icon={icons[option?.icon]} className={`${option?.class} w-6 h-6 rounded-md p-1 mr-2`} />
                : <div style={{ backgroundColor: `${option.color}` }} className="h-[0.375rem] w-[0.375rem] rounded-full mr-[0.125rem]" />
            }
            <p>{option?.value}</p>
          </button>
        ))}
        <button type="button" className="px-3 text-xs py-2 leading-6 font-medium text-text-muted hover:text-text">
          Add/edit options
        </button>
      </div>
    </div>
  );
}
