import React, { useState } from 'react';

const TriggerForm = ({ onSave }) => {
  const [trigger, setTrigger] = useState({ name: '', activityId: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrigger({ ...trigger, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(trigger); // API-Aufruf zum Speichern des Triggers
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={trigger.name}
        onChange={handleChange}
        placeholder="Trigger Name"
      />
      <input
        type="text"
        name="activityId"
        value={trigger.activityId}
        onChange={handleChange}
        placeholder="Activity ID (optional)"
      />
      <button type="submit">Trigger speichern</button>
    </form>
  );
};

export default TriggerForm;